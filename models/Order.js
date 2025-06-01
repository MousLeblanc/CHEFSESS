const mongoose = require('mongoose');

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
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le client est requis']
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le fournisseur est requis']
    },
    items: [orderItemSchema],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'delivered', 'cancelled'],
        default: 'pending'
    },
    total: {
        type: Number,
        required: true
    },
    deliveryDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Calculer le total automatiquement
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
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

module.exports = mongoose.model('Order', orderSchema); 