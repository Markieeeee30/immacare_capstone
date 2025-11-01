document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ signup.js is loaded!");

  const signupForm = document.getElementById("signup-form");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const toggleConfirmPasswordBtn = document.getElementById(
    "toggleConfirmPassword"
  );
  const birthdateInput = document.getElementById("birthdate");
  const ageInput = document.getElementById("age");
  const phoneInput = document.getElementById("phone"); // Phone Input
  const emailInput = document.getElementById("email");

  // --- CONSTANTS FOR VALIDATION ---
  const PHONE_PREFIX = "+639";
  const PHONE_MIN_LENGTH = 13; // +639 (4 chars) + 9 digits = 13 total
  // --- Utility Functions ---
  function capitalizeEachWord(str) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function isAllUppercase(str) {
    return str === str.toUpperCase() && /[A-Z]/.test(str);
  }

  const setupPasswordToggle = (inputElement, toggleButton) => {
    if (inputElement && toggleButton) {
      toggleButton.addEventListener("click", function () {
        const type =
          inputElement.getAttribute("type") === "password"
            ? "text"
            : "password";
        inputElement.setAttribute("type", type);

        // Toggle the icon classes
        const icon = this.querySelector("i");
        if (icon) {
          icon.classList.toggle("bi-eye");
          icon.classList.toggle("bi-eye-slash");
        }
      });
    }
  };

  setupPasswordToggle(passwordInput, togglePasswordBtn);
  setupPasswordToggle(confirmPasswordInput, toggleConfirmPasswordBtn);

  // --- MAIN FORM SUBMISSION AND VALIDATION ---
  if (signupForm && passwordInput && confirmPasswordInput && phoneInput) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Phone Number Length Validation
      if (phoneInput.value.length < PHONE_MIN_LENGTH) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Phone Number",
          text: "Please enter the full 9-digit mobile number after +639.",
        });
        phoneInput.focus();
        return; // Stop form submission
      }

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      const password = data.password ? data.password.trim() : "";
      const confirmPassword = data.confirmPassword
        ? data.confirmPassword.trim()
        : "";

      // 2. 🔑 Password Mismatch Validation
      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Password Mismatch",
          text: "Your passwords do not match. Please try again.",
        });
        confirmPasswordInput.value = "";
        confirmPasswordInput.focus();
        return; // Stop form submission
      }

      // 3. API Submission (If all validations pass)
      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        const alertIcon = response.ok ? "success" : "error";
        const alertTitle = response.ok
          ? "Registration Successful!"
          : "Registration Failed";

        Swal.fire({
          title: alertTitle,
          icon: alertIcon,
          text:
            result.message ||
            (response.ok ? "" : "Please check your form and try again."),
        }).then((result) => {
          if (response.ok && result.isConfirmed) {
            window.location.href = "../login/login.html";
          }
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while submitting the form. Check your network.",
        });
        console.error("Error:", error);
      }
    });
  }

  // --- Age Calculation Logic ---
  const today = new Date().toISOString().split("T")[0];
  if (birthdateInput) {
    birthdateInput.setAttribute("max", today);
    birthdateInput.addEventListener("change", () => {
      const birthdateValue = birthdateInput.value;
      if (!birthdateValue || !ageInput) {
        ageInput.value = "";
        return;
      }
      const birthDate = new Date(birthdateValue);
      const todayDate = new Date();
      let age = todayDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = todayDate.getMonth() - birthDate.getMonth();
      const dayDiff = todayDate.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      ageInput.value = age < 1 ? "" : age;
    });
  }

  // --- Name Formatting and Special Character Block ---
  const nameFields = ["firstName", "middleName", "lastName"];
  nameFields.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        let value = input.value;
        if (isAllUppercase(value)) {
          value = value.toLowerCase();
        }
        value = capitalizeEachWord(value);
        input.value = value.replace(/[^A-Za-z ]/g, "");
      });

      input.addEventListener("keydown", function (event) {
        const allowedKeys = [
          "Backspace",
          "ArrowLeft",
          "ArrowRight",
          "Tab",
          "Delete",
          " ",
        ];
        if (!allowedKeys.includes(event.key) && !event.key.match(/[A-Za-z]/)) {
          event.preventDefault();
        }
      });
    }
  });

  // --- Phone Number Formatting ---
  if (phoneInput) {
    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value.startsWith(PHONE_PREFIX)) {
        phoneInput.value = PHONE_PREFIX;
      }
    });
    phoneInput.addEventListener("input", () => {
      if (!phoneInput.value.startsWith(PHONE_PREFIX)) {
        const numbersOnly = phoneInput.value.replace(/\D/g, "");
        phoneInput.value = PHONE_PREFIX + numbersOnly.replace(/^639?/, "");
      }
      // Truncate to max length to prevent users from typing too many numbers
      if (phoneInput.value.length > PHONE_MIN_LENGTH) {
        phoneInput.value = phoneInput.value.substring(0, PHONE_MIN_LENGTH);
      }
    });
    phoneInput.addEventListener("keydown", (e) => {
      if (
        phoneInput.selectionStart <= PHONE_PREFIX.length &&
        (e.key === "Backspace" || e.key === "ArrowLeft")
      ) {
        e.preventDefault();
      }
    });
  }

  // --- Email Formatting ---
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      let value = emailInput.value.trim();
      const atIndex = value.indexOf("@");

      emailInput.value = value.toLowerCase();

      if (atIndex === -1) {
        return;
      }

      const local = value.slice(0, atIndex);
      const domain = value.slice(atIndex);
      const requiredDomain = "@gmail.com";

      // Simple attempt to auto-correct domain if user only typed part of it
      if (domain.length <= 1) {
        emailInput.value = local + requiredDomain;
      } else if (!domain.startsWith(requiredDomain)) {
        // This is a common pattern for specific domain enforcement
        // You might want to remove this if other email domains are allowed
        emailInput.value = local + requiredDomain;
      }
    });

    emailInput.addEventListener("blur", () => {
      let value = emailInput.value.trim().toLowerCase();

      if (value && value.indexOf("@") === -1) {
        emailInput.value = value + "@gmail.com";
      }
    });
  }
});
// me

