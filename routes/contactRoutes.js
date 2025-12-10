import express from 'express';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configuration du transporteur email
const createTransporter = () => {
  // Si des variables d'environnement SMTP sont configurées, les utiliser
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Si Gmail est configuré avec un mot de passe d'application
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  
  // Mode développement : transporter de test (log uniquement)
  console.log('⚠️ Aucune configuration SMTP trouvée. Mode développement - emails loggés uniquement.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test',
    },
  });
};

// @desc    Envoyer un message de contact
// @route   POST /api/contact
// @access  Public
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, organization, message } = req.body;

  // Validation des champs requis
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Les champs nom, email et message sont requis.',
    });
  }

  // Validation du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Format d\'email invalide.',
    });
  }

  try {
    const transporter = createTransporter();
    
    // Préparer le contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || `"Chef SES Contact" <noreply@chefses.com>`,
      to: process.env.CONTACT_EMAIL || 'info.chefses@gmail.com',
      replyTo: email,
      subject: `Contact depuis Chef SES - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #67C587;">Nouveau message de contact</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
            ${organization ? `<p><strong>Établissement:</strong> ${organization}</p>` : ''}
          </div>
          <hr style="border: 1px solid #e5e5e5; margin: 20px 0;">
          <div style="background: #ffffff; padding: 20px; border-left: 4px solid #67C587;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
      text: `
Nouveau message de contact

Nom: ${name}
Email: ${email}
${phone ? `Téléphone: ${phone}` : ''}
${organization ? `Établissement: ${organization}` : ''}

Message:
${message}
      `,
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de contact envoyé:', info.messageId);
    console.log('   À:', mailOptions.to);
    console.log('   De:', email);

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons sous 24h.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    
    // Si c'est un transporteur de test qui échoue, on log quand même
    if (!process.env.SMTP_HOST && !process.env.GMAIL_USER) {
      console.log('📧 Message de contact reçu (mode développement):');
      console.log('   Nom:', name);
      console.log('   Email:', email);
      console.log('   Message:', message);
      
      return res.status(200).json({
        success: true,
        message: 'Message reçu ! Nous vous répondrons sous 24h. (Mode développement)',
        development: true,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.',
    });
  }
}));

export default router;

