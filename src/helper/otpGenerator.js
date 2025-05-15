const generateOtp = () => {
    return Math.floor(10000 + Math.random() * 90000); // Generates a 5-digit OTP
};

module.exports = { generateOtp };
