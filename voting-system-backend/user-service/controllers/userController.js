const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Sms77Client = require('sms77-client');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sms77 = new Sms77Client(process.env.SMS77_API_KEY);

// Function to generate a certificate for a user
const generateCertificate = (username) => {
    return new Promise((resolve, reject) => {
        const certsDir = path.join(__dirname, '../certs'); // Ensure the directory path is correct
        const userKey = path.join(certsDir, `${username}.key`);
        const userCsr = path.join(certsDir, `${username}.csr`);
        const userCert = path.join(certsDir, `${username}.crt`);
        const caCert = path.join(certsDir, 'myCA.pem');
        const caKey = path.join(certsDir, 'myCA.key');
        const caKeyPassword = process.env.CA_KEY_PASSWORD;

        console.log(`Starting private key generation for ${username}`);
        const genKey = spawn('openssl', ['genrsa', '-out', userKey, '2048']);
        genKey.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`genrsa process exited with code ${code}`));
            }
            console.log(`Private key generated for ${username}`);

            console.log(`Starting CSR generation for ${username}`);
            const genCsr = spawn('openssl', ['req', '-new', '-key', userKey, '-out', userCsr, '-subj', `/CN=${username}`]);
            genCsr.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(`req process exited with code ${code}`));
                }
                console.log(`CSR generated for ${username}`);

                console.log(`Starting certificate signing for ${username}`);
                const signCert = spawn('openssl', ['x509', '-req', '-in', userCsr, '-CA', caCert, '-CAkey', caKey, '-CAcreateserial', '-out', userCert, '-days', '365', '-sha256', '-passin', `pass:${caKeyPassword}`]);
                signCert.on('close', (code) => {
                    if (code !== 0) {
                        return reject(new Error(`x509 process exited with code ${code}`));
                    }
                    console.log(`Certificate generated for ${username}`);
                    resolve(userCert);
                });
                signCert.stderr.on('data', (data) => {
                    console.error(`Error during certificate signing: ${data}`);
                });
            });
            genCsr.stderr.on('data', (data) => {
                console.error(`Error during CSR generation: ${data}`);
            });
        });
        genKey.stderr.on('data', (data) => {
            console.error(`Error during private key generation: ${data}`);
        });
    });
};

// Get all users
async function getAllUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Function to generate a username
const generateUsername = (fullName) => {
    return fullName.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 1000);
};

// Function to generate a random password
const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
};

// Function to send an email
const sendEmail = async (email, subject, html, attachments) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: html,
        attachments: attachments
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

// Function to send an SMS via sms77.io
const sendSMS = async (phoneNumber, message) => {
    const isValidPhoneNumber = /^\+\d{10,14}$/.test(phoneNumber); // Simple regex to validate international numbers
    if (!isValidPhoneNumber) {
        throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    try {
        const response = await sms77.sms({
            to: phoneNumber,
            text: message
        });

        if (response.success) {
            console.log('SMS sent successfully');
        } else {
            console.error('Failed to send SMS:', response.error);
            throw new Error(response.error);
        }
    } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
        throw error;
    }
};

// Import users from a JSON file
async function importUsers(req, res) {
    console.log('Received data:', req.body);
    const users = req.body;

    if (!Array.isArray(users)) {
        return res.status(400).send('Invalid data format. Expected an array of users.');
    }

    for (const user of users) {
        const { full_name, email, phone_number } = user;
        const username = generateUsername(full_name);
        const password = generatePassword();
        const password_hash = await bcrypt.hash(password, 10);
        const secret = speakeasy.generateSecret({ name: `Ydays_Voting_System (${username})` });

        const newUser = new User({
            username,
            password_hash,
            email,
            full_name,
            role: 'user',
            two_factor_secret: secret.base32
        });

        await newUser.save();

        const otpauth_url = secret.otpauth_url;
        const qrCodeDataUrl = await qrcode.toDataURL(otpauth_url);

        console.log(`Generating certificate for ${username}`);
        try {
            const userCertPath = await generateCertificate(username);
            const userCert = fs.readFileSync(userCertPath, 'utf8');

            // Store the certificate content in the user document
            newUser.certificate = userCert;
            await newUser.save();

            // Attach the certificate to the email
            const emailHtml = `
                <p>Welcome to Ydays Voting System!</p>
                <p>Here are your login details:</p>
                <p>Username: ${username},${password}</p>
                <p>Please use the following QR code to set up your 2FA:</p>
                <img src="cid:qrCode" alt="QR Code" />
                <p>Your certificate is attached to this email.</p>
            `;

            const emailAttachments = [
                {
                    filename: 'qrcode.png',
                    content: qrCodeDataUrl.split("base64,")[1],
                    encoding: 'base64',
                    cid: 'qrCode'
                },
                {
                    filename: `${username}.crt`,
                    content: userCert
                }
            ];

            console.log(`Sending email to ${email}`);
            await sendEmail(email, 'Your Account Details', emailHtml, emailAttachments);

            // Send the password via SMS
            const smsMessage = `Your Ydays Voting System password is: ${password}`;
            console.log(`Sending SMS to ${phone_number}`);
            await sendSMS(phone_number, smsMessage);

        } catch (err) {
            console.error(`Failed to generate certificate or send email/SMS for ${username}:`, err.message);
            if (!res.headersSent) {
                return res.status(400).send(`Failed to generate certificate or send email/SMS for ${username}: ${err.message}`);
            }
        }
    }

    if (!res.headersSent) {
        res.status(200).send('Users imported successfully');
    }
}

async function getUserData(userId) {
    try {
        const user = await User.findById(userId);
        console.log(user); // Ensure the role is correct here
        return user;
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching user data');
    }
}

// Get user by ID
async function getUserById(req, res) {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

// Update user role
async function updateUserRole(req, res) {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).send('Invalid role');
        }
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).send('User deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    importUsers
};
