document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input");
  const button = document.querySelector("button");
  const resendButton = document.getElementById("resendOTP");

  inputs.forEach((input, index1) => {
    input.addEventListener("keyup", (e) => {
      const currentInput = input;
      const nextInput = input.nextElementSibling;
      const prevInput = input.previousElementSibling;

      if (currentInput.value.length > 1) {
        currentInput.value = "";
        return;
      }

      if (
        nextInput &&
        nextInput.hasAttribute("disabled") &&
        currentInput.value !== ""
      ) {
        nextInput.removeAttribute("disabled");
        nextInput.focus();
      }

      if (e.key === "Backspace") {
        inputs.forEach((input, index2) => {
          if (index1 <= index2 && prevInput) {
            input.setAttribute("disabled", true);
            input.value = "";
            prevInput.focus();
          }
        });
      }

      if (!inputs[3].disabled && inputs[3].value !== "") {
        button.classList.add("active");
        return;
      }
      button.classList.remove("active");
    });
  });

  resendButton.addEventListener("click", () => {
    inputs.forEach((input) => {
      input.value = "";
      input.removeAttribute("disabled");
    });

    inputs[0].focus();
    button.classList.remove("active");
  });

  window.addEventListener("load", () => inputs[0].focus());
});




////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  // Set the initial time (in seconds)
  let timeLeft = 120; // Change this to your desired time

  // Function to update the timer display
  function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById("otp-timer").innerHTML = `Time Left: ${minutes}:${seconds}`;
  }

  // Function to decrement the timer and update the display
  function decrementTimer() {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimer();
    } else {
      // Disable form submission or redirect to a different page when the timer reaches 0
      // You can customize this behavior based on your requirements
    }
  }

  // Call the updateTimer function initially
  updateTimer();

  // Set an interval to decrement the timer every second
  const timerInterval = setInterval(decrementTimer, 1000);

  // Optionally, you can stop the timer when the form is submitted or when the page is unloaded
  document.querySelector("form").addEventListener("submit", function () {
    clearInterval(timerInterval);
  });

  // Optionally, you can stop the timer when the user navigates away from the page
  window.addEventListener("beforeunload", function () {
    clearInterval(timerInterval);
  });
});




















