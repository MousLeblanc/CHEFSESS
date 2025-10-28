// controllers/userController.js
import User from '../models/User.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            description: user.description,
            address: user.address,
            phone: user.phone,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        // Update new supplier fields
        if (user.role === 'fournisseur') {
            user.companyName = req.body.companyName || user.companyName;
            user.description = req.body.description || user.description;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;
        }

        const updatedUser = await user.save();

        res.json({
             _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyName: updatedUser.companyName,
            description: updatedUser.description,
            address: updatedUser.address,
            phone: updatedUser.phone,
        });

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

/**
 * @desc    Get all suppliers (users with role 'fournisseur')
 * @route   GET /api/users/suppliers
 * @access  Private
 */
export const getSuppliers = async (req, res) => {
    try {
        // ✅ Retourner les vrais fournisseurs depuis la collection Supplier
        const Supplier = (await import('../models/Supplier.js')).default;
        
        const suppliers = await Supplier.find({})
            .select('_id name email contact phone address type isBio products status rating')
            .sort({ createdAt: -1 });

        console.log(`✅ [userController.getSuppliers] ${suppliers.length} fournisseurs retournés`);

        res.json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des fournisseurs'
        });
    }
};