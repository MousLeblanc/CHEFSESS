// models/Order.js
import mongoose from 'mongoose'; // Changé de require à import

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La quantité minimum est de 1']
    },
    price: { // Prix au moment de la commande
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    client: { // Utilisateur (restaurant) qui passe la commande
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le client est requis']
    },
    supplier: { // Utilisateur (fournisseur) qui reçoit la commande
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le fournisseur est requis']
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled'], // 'shipped' ajouté
        default: 'pending'
    },
    total: { // Le total sera calculé par le hook pre-save
        type: Number,
        required: true,
        default: 0
    },
    deliveryDate: { // Date de livraison souhaitée par le client
        type: Date,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Calculer le total automatiquement avant de sauvegarder
orderSchema.pre('save', function(next) {
    if (this.isModified('items') || this.isNew) { // Recalculer si les items changent ou si c'est une nouvelle commande
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }
    next();
});

// Index pour améliorer les performances
orderSchema.index({ client: 1, status: 1 });
orderSchema.index({ supplier: 1, status: 1 });
orderSchema.index({ deliveryDate: 1 });

const Order = mongoose.model('Order', orderSchema); // Changé pour définir Order avant d'exporter
export default Order; // Changé de module.exports