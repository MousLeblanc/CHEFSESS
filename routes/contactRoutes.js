import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Fonction pour envoyer l'email (peut être étendue avec nodemailer plus tard)
const sendEmail = async (mailOptions) => {
  // Pour l'instant, on log simplement le message
  // TODO: Configurer nodemailer ou un service d'email tiers (SendGrid, Mailgun, etc.)
  console.log('📧 Email de contact reçu:');
  console.log('   De:', mailOptions.from);
  console.log('   À:', mailOptions.to);
  console.log('   Sujet:', mailOptions.subject);
  console.log('   Contenu:', mailOptions.text);
  
  // Simuler un envoi réussi
  return {
    messageId: `contact-${Date.now()}@chefses.local`,
    accepted: [mailOptions.to],
  };
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
    // Préparer le contenu de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Chef SES Contact" <noreply@chefses.com>`,
      to: process.env.CONTACT_EMAIL || 'info.chefses@gmail.com',
      replyTo: email,
      subject: `Contact depuis Chef SES - ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
        ${organization ? `<p><strong>Établissement:</strong> ${organization}</p>` : ''}
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
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

    // Envoyer l'email (pour l'instant, juste logging)
    const info = await sendEmail(mailOptions);
    
    console.log('✅ Message de contact reçu:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons sous 24h.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du message:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.',
    });
  }
}));

export default router;

