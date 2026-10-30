

const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async (event) => {

    // Empêcher le rechargement automatique de la page
    event.preventDefault();

    // Récupérer les informations du formulaire
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Créer l'objet utilisateur
    const user = {
        email: email,
        password: password
    };

    // Récupérer l'élément qui affiche les erreurs
    const errorMessage = document.querySelector("#login-error");

    // Effacer un éventuel message précédent
    errorMessage.textContent = "";

    try {
        // Envoyer les identifiants à l'API
        const response = await fetch(
            "http://localhost:5678/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            }
        );

        // Vérifier la réponse du serveur
        if (!response.ok) {
            throw new Error("Email ou mot de passe incorrect");
        }

        // Récupérer les données retournées par l'API
        const data = await response.json();

        // Vérifier que le token existe
        if (!data.token) {
            throw new Error("Token d'authentification manquant");
        }

        // Enregistrer le token
        sessionStorage.setItem("token", data.token);

        // Rediriger vers l'accueil
        window.location.href = "./index.html";

    } catch (error) {
        // Afficher une erreur à l'utilisateur
        errorMessage.textContent = error.message;
    }
});
