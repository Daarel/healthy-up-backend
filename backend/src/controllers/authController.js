import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

/**
 * @desc    Sign up user account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username, email, and password are required",
      });
    }

    // check if email already exists
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return res.status(400).json({
        status: "error",
        message: "Email is already registered",
      });
    }

    // check if username already taken
    const usernameExists = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameExists) {
      return res.status(400).json({
        status: "error",
        message: "Username is already taken",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error at register", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Sign in user account
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email and password" });
    }

    // verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email and password" });
    }

    const token = generateToken(user.id, res);

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error at login:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      status: "error",
      message: err.message, // sementara tampilkan pesan asli untuk debug
    });
  }
};

/**
 * @desc    Log out user account
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logoutUser = async (_req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Error at logout", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Request OTP for password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 menit

    await prisma.otpCode.upsert({
      where: { email },
      update: { code: otpCode, expiresAt },
      create: { email, code: otpCode, expiresAt },
    });

    console.log(`[SIMULASI EMAIL] OTP untuk ${email} adalah: ${otpCode}`);

    res.status(200).json({
      status: "success",
      message: "OTP has been sent to your email (expires in 1 minute)",
    });
  } catch (err) {
    console.error("Error at forgotPassword", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

/**
 * @desc    Verify OTP and reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmedPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmedPassword) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmedPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    const otpRecord = await prisma.otpCode.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or missing OTP" });
    }

    if (otpRecord.code !== otp) {
      return res
        .status(400)
        .json({ status: "error", message: "Incorrect OTP code" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        status: "error",
        message: "OTP has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.otpCode.delete({
        where: { email },
      }),
    ]);

    res.status(200).json({
      status: "success",
      message: "Password has been successfully changed",
    });
  } catch (err) {
    console.error("Error at resetPassword", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export { registerUser, loginUser, logoutUser, forgotPassword, resetPassword };
