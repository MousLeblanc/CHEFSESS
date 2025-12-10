import express from 'express';
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import ContactMessage from '../models/ContactMessage.js';

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
    // Enlever TOUS les espaces, tabulations, retours à la ligne, etc.
    const appPassword = process.env.GMAIL_APP_PASSWORD.replace(/[\s\t\n\r]/g, '').trim();
    const gmailUser = process.env.GMAIL_USER.trim();
    
    console.log('📧 Configuration Gmail détectée');
    console.log('   User:', gmailUser);
    console.log('   App Password length:', appPassword.length, 'caractères');
    console.log('   App Password (preview):', appPassword.length > 0 ? appPassword.substring(0, 4) + '...' + appPassword.substring(appPassword.length - 4) : 'VIDE');
    console.log('   App Password contient uniquement des caractères alphanumériques:', /^[a-zA-Z0-9]+$/.test(appPassword));
    
    // Vérifier que le mot de passe a la bonne longueur (16 caractères sans espaces)
    if (appPassword.length !== 16) {
      console.error('⚠️ ATTENTION: Le mot de passe d\'application doit faire exactement 16 caractères (sans espaces)');
      console.error('   Longueur actuelle:', appPassword.length);
      console.error('   Mot de passe original (avec espaces):', process.env.GMAIL_APP_PASSWORD.length, 'caractères');
    }
    
    // Vérifier que le mot de passe ne contient que des caractères alphanumériques
    if (!/^[a-zA-Z0-9]+$/.test(appPassword)) {
      console.error('⚠️ ATTENTION: Le mot de passe d\'application contient des caractères invalides');
      console.error('   Il ne doit contenir que des lettres et chiffres (pas de tirets, espaces, etc.)');
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: appPassword,
      },
      // Options supplémentaires pour Gmail
      tls: {
        rejectUnauthorized: false
      }
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

  // Sauvegarder le message dans MongoDB d'abord
  let savedMessage;
  try {
    savedMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || undefined,
      organization: organization || undefined,
      message,
      emailSent: false,
      status: 'new'
    });
    console.log('✅ Message de contact sauvegardé dans MongoDB:', savedMessage._id);
  } catch (dbError) {
    console.error('❌ Erreur lors de la sauvegarde en base de données:', dbError);
    // Continuer quand même, on essaiera d'envoyer l'email
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
    
    // Avertissement si on envoie à la même adresse
    if (senderEmail === recipientEmail) {
      console.warn('⚠️ ATTENTION: L\'email est envoyé depuis et vers la même adresse');
      console.warn('   Gmail peut filtrer ces emails. Vérifiez votre dossier Spam ou "Tous les messages"');
    }
    
    // Utiliser l'adresse réelle mais avec un nom d'affichage clair
    const fromAddress = process.env.SMTP_FROM || `"Chef SES Contact Form" <${senderEmail}>`;
    
    // Si on envoie vers la même adresse, ajouter des instructions pour créer un filtre Gmail
    if (senderEmail === recipientEmail) {
      console.log('');
      console.log('📬 POUR RECEVOIR LES EMAILS DANS info.chefses@gmail.com:');
      console.log('   1. Allez dans Gmail > Paramètres > Filtres et adresses bloquées');
      console.log('   2. Créez un filtre avec:');
      console.log('      - De: info.chefses@gmail.com');
      console.log('      - Objet contient: "Contact depuis Chef SES"');
      console.log('   3. Cochez "Ne jamais l\'envoyer vers Spam"');
      console.log('   4. Cochez "Marquer comme important"');
      console.log('   5. Appliquez le filtre');
      console.log('');
    }
    
    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      replyTo: email,
      subject: `Contact depuis Chef SES - ${name}`,
      // Ajouter des en-têtes pour éviter le filtrage
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': `<mailto:${recipientEmail}?subject=unsubscribe>`,
        'X-Mailer': 'Chef SES Contact Form'
      },
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
    console.log('');
    console.log('📬 VÉRIFICATIONS:');
    console.log('   1. Vérifiez votre boîte de réception Gmail');
    console.log('   2. Vérifiez le dossier SPAM/Indésirables');
    console.log('   3. Vérifiez l\'onglet "Promotions" dans Gmail');
    console.log('   4. Recherchez l\'objet: "Contact depuis Chef SES - [nom]"');
    console.log('   5. Si l\'email est envoyé vers la même adresse que l\'expéditeur, vérifiez "Tous les messages"');

    // Mettre à jour le message en base de données
    if (savedMessage) {
      savedMessage.emailSent = true;
      await savedMessage.save();
      console.log('✅ Message mis à jour dans MongoDB: email envoyé');
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
    
    // Si c'est une erreur d'authentification Gmail, on peut quand même sauvegarder le message
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.log('📧 Message de contact reçu (mais email non envoyé - problème d\'authentification):');
      console.log('   Nom:', name);
      console.log('   Email:', email);
      console.log('   Téléphone:', phone || 'N/A');
      console.log('   Établissement:', organization || 'N/A');
      console.log('   Message:', message);
      console.log('');
      console.log('⚠️ ACTION REQUISE: Corrigez la configuration Gmail dans .env');
      console.log('   Le message a été sauvegardé dans MongoDB mais n\'a pas été envoyé par email.');
      
      // Mettre à jour le message en base de données avec l'erreur
      if (savedMessage) {
        savedMessage.emailError = error.message;
        savedMessage.emailSent = false;
        await savedMessage.save();
        console.log('✅ Message mis à jour dans MongoDB avec l\'erreur email');
      }
      
      // Retourner une réponse partielle pour que le formulaire ne reste pas bloqué
      return res.status(200).json({
        success: true,
        message: 'Message reçu ! Cependant, l\'envoi par email a échoué. Nous avons enregistré votre message et vous contacterons sous 24h.',
        development: true,
        emailSent: false,
      });
    }
    
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

