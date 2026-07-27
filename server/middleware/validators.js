const { body } = require("express-validator");

const signupRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage("Phone must be 10 digits"),
  body("address").optional({ checkFalsy: true }).isLength({ max: 500 }),
  body("newPassword").optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

const checkoutRules = [
  body("shippingAddress").trim().isLength({ min: 8 }).withMessage("Please enter a full shipping address"),
  body("phone").matches(/^[0-9]{10}$/).withMessage("Please enter a valid 10-digit phone number"),
  body("paymentMethod").isIn(["COD", "RAZORPAY", "UPI"]).withMessage("Invalid payment method"),
];

const productRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Please enter a valid price"),
  body("stock").isInt({ min: 0 }).withMessage("Please enter a valid stock quantity"),
  body("category").optional().trim().isLength({ max: 100 }),
  body("image_url")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Image URL must be text"),
];

const reviewRules = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage("Comment is too long"),
];

module.exports = {
  signupRules,
  loginRules,
  profileRules,
  checkoutRules,
  productRules,
  reviewRules,
};
