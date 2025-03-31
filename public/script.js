document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const retrieveForm = document.getElementById("retrieve-form");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;
        const key = document.getElementById("register-key").value;

        if (!username || !password || !key) {
            alert("All fields are required!");
            return;
        }

        // Encrypt password locally using AES before sending to server
        const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, encryptedPassword }),
            });

            const data = await response.json();
            alert(data.message || data.error);
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to register user.");
        }
    });

    retrieveForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("retrieve-username").value;
        const key = document.getElementById("retrieve-key").value;

        if (!username || !key) {
            alert("Both fields are required!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                // Decrypt password locally
                const decryptedBytes = CryptoJS.AES.decrypt(data.password, key);
                const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

                if (!decryptedPassword) {
                    alert("Incorrect decryption key!");
                } else {
                    alert(`Decrypted Password: ${decryptedPassword}`);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to retrieve password.");
        }
    });
});
