
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const formData = require('./models/User');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log(" MongoDB connected"))
    .catch(err => console.error(" MongoDB connection error:", err));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});


transporter.verify((err, success) => {
    if (err) console.error("❌ Email transporter error:", err);
    else console.log("✅ Email transporter ready");
});

// Handle form submission
app.post('/contact', async (req, res) => {
    try {
        console.log("✅ Received form data:", req.body);
        const { name, phone, email, business, message } = req.body;


        const newform = new formData(req.body);
        await newform.save();

        // Send thank you email
        try {
            await sendThankYouEmail(name, email);
        } catch (err) {
            console.error("❌ Error sending thank you email:", err.message);
        }

        // Send notification to client
        try {
            await sendNotification({ name, phone, email, business, message });
        } catch (err) {
            console.error("❌ Error sending notification email:", err.message);
        }


        res.json({ success: true, message: 'Form submitted successfully' });

    } catch (err) {
        console.error("❌ Server error:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Functions for emails
const sendThankYouEmail = (name, email) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for submitting form',
        html: `<h2>Hello ${name},</h2>
           <p>Thank you for submitting the form. We have received your information and will get back to you shortly.</p>
           <p>Best regards,<br>Flourish Digital</p>`
    };
    return transporter.sendMail(mailOptions);
};

const sendNotification = (formData) => {
    const mailOptions = {
        from: `"Form Submission Notification" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_CLIENT,
        subject: 'New Form Submission Received',
        html: `<h2>NEW FORM SUBMISSION</h2>
           <p><strong>Name:</strong> ${formData.name}</p>
           <p><strong>Phone:</strong> ${formData.phone}</p>
           <p><strong>Email:</strong> ${formData.email}</p>
           <p><strong>Business:</strong> ${formData.business}</p>
           <p><strong>Message:</strong> ${formData.message}</p>`
    };
    return transporter.sendMail(mailOptions);
};

app.listen(5000, () => console.log("🚀 Server running on port 5000"));