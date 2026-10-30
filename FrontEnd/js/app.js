
const API_URL = "http://localhost:5678/api";

// =====================================
// 1. AFFICHAGE DES PROJETS
// =====================================

const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".div-filter");

// Filtre actuellement sélectionné
let currentFilter = null;

async function getWorks(filter = currentFilter) {

    currentFilter = filter;

    try {
        const response = await fetch(`${API_URL}/works`);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les projets");
        }

        const works = await response.json();

        // Filtrer uniquement si une catégorie est sélectionnée
        const filteredWorks = filter === null
            ? works
            : works.filter(
                (work) => Number(work.categoryId) === Number(filter)
            );

        // Vider la galerie avant de la reconstruire
        gallery.innerHTML = "";

        for (let i = 0; i < filteredWorks.length; i++) {
            setFigure(filteredWorks[i]);
        }

    } catch (error) {
        console.error("Erreur de chargement :", error);
    }
}

// Créer une figure dans le portfolio principal
function setFigure(data) {

    const figure = document.createElement("figure");
    figure.dataset.id = data.id;

    const image = document.createElement("img");
    image.src = data.imageUrl;
    image.alt = data.title;

    const caption = document.createElement("figcaption");
    caption.textContent = data.title;

    figure.append(image, caption);
    gallery.append(figure);
}


// =====================================
// 2. FILTRES DES CATÉGORIES
// =====================================

async function getcategories() {

    try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les catégories");
        }

        const categories = await response.json();

        // Supprimer les anciens boutons
        filtersContainer.innerHTML = "";

        // Bouton Tous
        const allButton = document.createElement("button");
        allButton.type = "button";
        allButton.textContent = "Tous";

        allButton.addEventListener("click", () => {
            getWorks(null);
        });

        filtersContainer.append(allButton);

        // Créer les autres filtres
        for (let i = 0; i < categories.length; i++) {
            setFilter(categories[i]);
        }

    } catch (error) {
        console.error("Erreur catégories :", error);
    }
}

// Créer un bouton pour chaque catégorie
function setFilter(data) {

    const button = document.createElement("button");
    button.type = "button";

    button.textContent = data.name;

    button.addEventListener("click", () => {
        getWorks(data.id);
    });

    filtersContainer.append(button);
}


// =====================================
// 3. CONNEXION ET MODE ÉDITION
// =====================================

const authLink = document.querySelector("#auth-link");
const editBanner = document.querySelector("#edit-banner");
const editButton = document.querySelector("#edit-button");

function checkLogin() {

    const token = sessionStorage.getItem("token");

    if (token) {

        // Affichage administrateur
        authLink.textContent = "logout";
        authLink.href = "#";

        editBanner.hidden = false;
        editButton.hidden = false;
        filtersContainer.hidden = true;

    } else {

        // Affichage visiteur
        authLink.textContent = "login";
        authLink.href = "./login.html";

        editBanner.hidden = true;
        editButton.hidden = true;
        filtersContainer.hidden = false;
    }
}

// Déconnexion
authLink.addEventListener("click", (event) => {

    const token = sessionStorage.getItem("token");

    if (token) {

        event.preventDefault();

        sessionStorage.removeItem("token");

        window.location.reload();
    }
});


// =====================================
// 4. GESTION DE LA MODALE
// =====================================

const modal = document.querySelector("#modal");
const closeModalButton = document.querySelector("#close-modal");

const modalGallery = document.querySelector("#modal-gallery");
const modalAdd = document.querySelector("#modal-add");

const addPhotoButton = document.querySelector("#add-photo");
const backModalButton = document.querySelector("#back-modal");

const modalWorks = document.querySelector(".modal-works");
const modalError = document.querySelector("#modal-error");

// Ouvrir la modale
function openModal() {

    if (!sessionStorage.getItem("token")) {
        return;
    }

    modal.hidden = false;

    // Afficher la galerie photo en premier
    modalGallery.hidden = false;
    modalAdd.hidden = true;

    // Récupérer les projets
    getModalWorks();
}

// Fermer la modale
function closeModalWindow() {

    modal.hidden = true;

    // Réinitialiser le formulaire
    resetAddPhotoForm();
}

// Clic sur Modifier
editButton.addEventListener("click", openModal);

// Clic sur la croix
closeModalButton.addEventListener("click", closeModalWindow);

// Clic sur le fond gris
modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        closeModalWindow();
    }
});

// Fermeture avec Échap
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && !modal.hidden) {
        closeModalWindow();
    }
});

// Passer à la vue Ajout photo
addPhotoButton.addEventListener("click", async () => {

    modalGallery.hidden = true;
    modalAdd.hidden = false;

    await getModalCategories();
});

// Revenir à la galerie photo
backModalButton.addEventListener("click", () => {

    resetAddPhotoForm();

    modalAdd.hidden = true;
    modalGallery.hidden = false;
});


// =====================================
// 5. AFFICHAGE DES PROJETS DANS LA MODALE
// =====================================

async function getModalWorks() {

    modalWorks.innerHTML = "";

    if (modalError) {
        modalError.textContent = "";
    }

    try {
        const response = await fetch(`${API_URL}/works`);

        if (!response.ok) {
            throw new Error("Impossible de charger les projets");
        }

        const works = await response.json();

        for (let i = 0; i < works.length; i++) {
            setModalFigure(works[i]);
        }

    } catch (error) {

        console.error(error);

        if (modalError) {
            modalError.textContent = error.message;
        }
    }
}

// Créer une miniature avec sa corbeille
function setModalFigure(data) {

    const figure = document.createElement("figure");
    figure.dataset.id = data.id;

    const image = document.createElement("img");
    image.src = data.imageUrl;
    image.alt = data.title;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";

    deleteButton.setAttribute(
        "aria-label",
        "Supprimer " + data.title
    );

    // Icône corbeille SVG
    deleteButton.innerHTML = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <path d="M3 6h18"/>
            <path d="M8 6V4h8v2"/>
            <path d="M5 6l1 15h12l1-15"/>
            <path d="M10 10v7"/>
            <path d="M14 10v7"/>
        </svg>
    `;

    // Supprimer le projet au clic
    deleteButton.addEventListener("click", () => {
        deleteWork(data.id, deleteButton);
    });

    figure.append(image, deleteButton);
    modalWorks.append(figure);
}


// =====================================
// 6. SUPPRESSION D'UN PROJET
// =====================================

async function deleteWork(id, deleteButton) {

    const token = sessionStorage.getItem("token");

    if (modalError) {
        modalError.textContent = "";
    }

    if (!token) {

        if (modalError) {
            modalError.textContent = "Vous devez être connecté.";
        }

        return;
    }

    // Éviter les clics multiples
    deleteButton.disabled = true;

    try {

        const response = await fetch(`${API_URL}/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Impossible de supprimer ce projet");
        }

        // Retirer le projet de la modale
        const modalFigure = Array.from(
            modalWorks.querySelectorAll("figure")
        ).find((figure) => figure.dataset.id === String(id));

        if (modalFigure) {
            modalFigure.remove();
        }

        // Retirer le projet du portfolio principal
        const galleryFigure = Array.from(
            gallery.querySelectorAll("figure")
        ).find((figure) => figure.dataset.id === String(id));

        if (galleryFigure) {
            galleryFigure.remove();
        }

        console.log("Projet supprimé :", id);

    } catch (error) {

        console.error(error);

        if (modalError) {
            modalError.textContent = error.message;
        }

        deleteButton.disabled = false;
    }
}


// =====================================
// 7. CATÉGORIES DU FORMULAIRE D'AJOUT
// =====================================

async function getModalCategories() {

    const select = document.querySelector("#photo-category");
    const errorMessage = document.querySelector("#add-photo-error");

    // Réinitialiser les options
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Sélectionner une catégorie";

    select.append(placeholder);

    errorMessage.textContent = "";

    try {

        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
            throw new Error("Impossible de charger les catégories");
        }

        const categories = await response.json();

        for (let i = 0; i < categories.length; i++) {

            const option = document.createElement("option");

            option.value = categories[i].id;
            option.textContent = categories[i].name;

            select.append(option);
        }

        updateSubmitButton();

    } catch (error) {

        console.error(error);
        errorMessage.textContent = error.message;
    }
}


// =====================================
// 8. VALIDATION DU FORMULAIRE
// =====================================

const addPhotoForm = document.querySelector("#add-photo-form");

const photoInput = document.querySelector("#photo");
const photoTitle = document.querySelector("#photo-title");
const photoCategory = document.querySelector("#photo-category");

const photoPreview = document.querySelector("#photo-preview");
const uploadPlaceholder = document.querySelector("#upload-placeholder");

const submitPhotoButton = document.querySelector("#submit-photo");
const addPhotoError = document.querySelector("#add-photo-error");

// Taille maximale : 4 Mo
const MAX_FILE_SIZE = 4 * 1024 * 1024;

let previewUrl = null;
let isSubmitting = false;

// Vérifier le format et la taille du fichier
function isValidFile(file) {

    if (!file) {
        return false;
    }

    const validTypes = ["image/jpeg", "image/png"];

    return (
        validTypes.includes(file.type) &&
        file.size > 0 &&
        file.size <= MAX_FILE_SIZE
    );
}

// Vérifier le formulaire
function isFormValid() {

    const file = photoInput.files[0];

    return (
        isValidFile(file) &&
        photoTitle.value.trim() !== "" &&
        photoCategory.value !== ""
    );
}

// Activer ou désactiver Valider
function updateSubmitButton() {

    submitPhotoButton.disabled =
        isSubmitting || !isFormValid();
}

// Gestion de la sélection d'une image
photoInput.addEventListener("change", () => {

    const file = photoInput.files[0];

    // Libérer l'ancien aperçu
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    photoPreview.hidden = true;
    photoPreview.removeAttribute("src");

    uploadPlaceholder.hidden = false;
    addPhotoError.textContent = "";

    if (!file) {
        updateSubmitButton();
        return;
    }

    if (!isValidFile(file)) {

        addPhotoError.textContent =
            "Choisissez une image JPG ou PNG de 4 Mo maximum.";

        photoInput.value = "";

        updateSubmitButton();
        return;
    }

    // Créer un aperçu de l'image
    previewUrl = URL.createObjectURL(file);

    photoPreview.src = previewUrl;
    photoPreview.hidden = false;

    uploadPlaceholder.hidden = true;

    updateSubmitButton();
});

// Réagir à la saisie du titre
photoTitle.addEventListener("input", updateSubmitButton);

// Réagir au choix de la catégorie
photoCategory.addEventListener("change", updateSubmitButton);

// Réinitialiser le formulaire
function resetAddPhotoForm() {

    addPhotoForm.reset();

    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
    }

    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;

    uploadPlaceholder.hidden = false;

    addPhotoError.textContent = "";

    updateSubmitButton();
}


// =====================================
// 9. AJOUT D'UN NOUVEAU PROJET
// =====================================

addPhotoForm.noValidate = true;

addPhotoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (isSubmitting) {
        return;
    }

    addPhotoError.textContent = "";

    // Vérifier le formulaire
    if (!isFormValid()) {

        addPhotoError.textContent =
            "Veuillez compléter tous les champs correctement.";

        return;
    }

    // Récupérer le token
    const token = sessionStorage.getItem("token");

    if (!token) {

        addPhotoError.textContent =
            "Vous devez être connecté pour ajouter un projet.";

        return;
    }

    // Récupérer les informations
    const file = photoInput.files[0];
    const title = photoTitle.value.trim();
    const category = photoCategory.value;

    // Préparer FormData
    const formData = new FormData();

    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    isSubmitting = true;

    submitPhotoButton.disabled = true;
    submitPhotoButton.textContent = "Envoi en cours...";

    try {

        // Envoyer le projet à l'API
        const response = await fetch(`${API_URL}/works`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {

            throw new Error(
                "Erreur lors de l'ajout : " + response.status
            );
        }

        // Récupérer le nouveau projet
        const newWork = await response.json();

        console.log("Projet ajouté :", newWork);

        // Mettre à jour les deux galeries
        if (newWork && newWork.id != null &&
            newWork.imageUrl && newWork.title) {

            // Ajouter uniquement le nouveau projet
            if (
                currentFilter === null ||
                Number(newWork.categoryId) === Number(currentFilter)
            ) {
                setFigure(newWork);
            }

            setModalFigure(newWork);

        } else {

            // Si la réponse ne contient pas tous les champs,
            // récupérer les projets enregistrés sur le serveur
            await getWorks();
            await getModalWorks();
        }

        // Réinitialiser le formulaire
        resetAddPhotoForm();

        // Retour à Galerie photo
        modalAdd.hidden = true;
        modalGallery.hidden = false;

    } catch (error) {

        console.error(error);
        addPhotoError.textContent = error.message;

    } finally {

        isSubmitting = false;

        submitPhotoButton.textContent = "Valider";

        updateSubmitButton();
    }
});


// =====================================
// 10. INITIALISATION DE LA PAGE
// =====================================

// Vérifier le mode connecté ou visiteur
checkLogin();

// Afficher les projets du portfolio
getWorks();

// Créer les boutons des filtres
getcategories();
