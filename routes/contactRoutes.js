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
    // Enlever les espaces du mot de passe d'application (Gmail les affiche avec des espaces mais il faut les enlever)
    const appPassword = process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '').trim();
    
    console.log('📧 Configuration Gmail détectée');
    console.log('   User:', process.env.GMAIL_USER);
    console.log('   App Password length:', appPassword.length, 'caractères');
    console.log('   App Password (preview):', appPassword.length > 0 ? appPassword.substring(0, 4) + '...' + appPassword.substring(appPassword.length - 4) : 'VIDE');
    
    // Vérifier que le mot de passe a la bonne longueur (16 caractères sans espaces)
    if (appPassword.length !== 16) {
      console.error('⚠️ ATTENTION: Le mot de passe d\'application doit faire exactement 16 caractères (sans espaces)');
      console.error('   Longueur actuelle:', appPassword.length);
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER.trim(),
        pass: appPassword,
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
    
    // Vérifier que le transporteur est bien configuré
    if (!transporter) {
      throw new Error('Transporteur email non configuré');
    }
    
    // Préparer le contenu de l'email
    const recipientEmail = process.env.CONTACT_EMAIL || 'info.chefses@gmail.com';
    const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@chefses.com';
    
    console.log('📧 Préparation de l\'email:');
    console.log('   De:', senderEmail);
    console.log('   À:', recipientEmail);
    console.log('   Reply-To:', email);
    
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Chef SES Contact" <${senderEmail}>`,
      to: recipientEmail,
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
    console.log('📤 Tentative d\'envoi de l\'email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de contact envoyé avec succès!');
    console.log('   Message ID:', info.messageId);
    console.log('   À:', mailOptions.to);
    console.log('   De:', email);
    console.log('   Réponse acceptée:', info.accepted);
    if (info.rejected && info.rejected.length > 0) {
      console.log('   ⚠️ Rejeté:', info.rejected);
    }

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons sous 24h.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:');
    console.error('   Type:', error.constructor.name);
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    console.error('   Stack:', error.stack);
    
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
    
    // Message d'erreur plus détaillé pour l'utilisateur
    let errorMessage = 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.';
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'Erreur d\'authentification Gmail. Vérifiez votre mot de passe d\'application dans le fichier .env';
      console.error('🔴 PROBLÈME D\'AUTHENTIFICATION GMAIL:');
      console.error('   1. Vérifiez que la validation en 2 étapes est activée sur votre compte Gmail');
      console.error('   2. Créez un nouveau mot de passe d\'application: https://myaccount.google.com/apppasswords');
      console.error('   3. Dans .env, GMAIL_APP_PASSWORD doit être SANS ESPACES (16 caractères)');
      console.error('   4. Redémarrez le serveur après modification du .env');
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Impossible de se connecter au serveur email.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}));

export default router;

