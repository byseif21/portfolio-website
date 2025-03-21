document.addEventListener("DOMContentLoaded", () => {
    const blobs = document.querySelectorAll(".blob");
    let currentScroll = 0;

    function handleScroll() {
        currentScroll = window.pageYOffset;

        blobs.forEach((blob, index) => {
            const xOffset = Math.sin(currentScroll / 100 + index * 0.5) * 340;
            const yOffset = Math.cos(currentScroll / 100 + index * 0.5) * 40;

            blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });

        requestAnimationFrame(handleScroll);
    }

    window.addEventListener("scroll", handleScroll);
});

// Starting the typing effect (for the welcome screen)
const words2 = ["www.seifsoliman.com"];
const dynamicText2 = document.querySelector(".myweblink");
let wordIndex2 = 0;
let charIndex2 = 0;
let isDeleting2 = false;

function typeEffect2() {
    const currentWord = words2[wordIndex2];
    const displayedText = currentWord.substring(0, charIndex2);
    dynamicText2.textContent = displayedText;

    if (!isDeleting2 && charIndex2 < currentWord.length) {
        charIndex2++;
        setTimeout(typeEffect2, 120); // Typing speed
    } else if (isDeleting2 && charIndex2 > 0) {
        charIndex2--;
        setTimeout(typeEffect2, charIndex2 === 1 ? 300 : 60); // Deleting speed
    } else if (!isDeleting2) {
        setTimeout(() => {
            isDeleting2 = true;
            typeEffect2();
        }, 1500); // Pause before deleting
    } else {
        isDeleting2 = false;
        wordIndex2 = (wordIndex2 + 1) % words2.length;
        setTimeout(typeEffect2, 300); // Move to the next word
    }
}

// Start the typing effect immediately
typeEffect2();

// Wait for the welcome screen to be 70% faded
setTimeout(() => {
    const welcomeScreen = document.getElementById("welcome-screen");
    welcomeScreen.style.display = "none";

    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "block";

    // Initialize the page
    initializePage();
}, 3500); // 70% of 5 seconds = 3.5 seconds

// remove the loading screen after the page loads
window.addEventListener("load", () => {
    const loadingScreen = document.querySelector(".loading-screen");
    loadingScreen.style.opacity = "0";  // Fade out effect
    setTimeout(() => {
        loadingScreen.style.display = "none"; // Remove from DOM
    }, 500); // Wait for fade effect
});

// Function to initialize the page
function initializePage() {
    // Intersection Observer for scroll animations
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        },
        { threshold: 0.1 }
    );
    sections.forEach((section) => observer.observe(section));

    // Sample data for projects and certificates
    const projects = [

        {
            id: 1,
            title: "Clothing Frontend Project",
            description: "A custom, responsive front-end e-commerce template designed and built from scratch.",
            image: "img/projects/project1.png",
            link: "https://byseif21.github.io/OnKloFrontDD/index.html#",
            github: "https://github.com/byseif21/OnKloFrontDD",
            techStack: ["HTML", "CSS", "JavaScript"],
        },
        {
            id: 2,
            title: "Static Portfolio Website Project",
            description: "This is my personal portfolio website, showcasing my skills, projects, and experience as a Full Stack Developer.",
            image: "img/projects/project2.png",
            link: "#",
            github: "https://github.com/byseif21/portfolio-website",
            techStack: ["HTML", "CSS", "JavaScript"],
        },

        {
            id: 3,
            title: "OnKlo - Full-Stack E-Commerce Platform",
            description: "The full MVC version of the Clothing Frontend Project, now a dynamic and scalable e-commerce platform.",
            image: "img/projects/project1.png",
            link: "https://byseif21.github.io/OnKloFrontDD/index.html#",
            github: "https://github.com/byseif21/OnKlo",
            techStack: ["C#", "ASP.NET MVC", "HTML5", "CSS", "JavaScript", "Entity Framework", "SQL Server"]
        },

        {
            id: 4,
            title: "Movie Rating Website Platform",
            description: "An advanced, full-featured movie rating and review platform built with .NET MVC.",
            image: "img/projects/project4.jpg",
            link: "javascript:void(0);",
            github: "https://github.com/byseif21/eRmovie",
            techStack: ["C#", "ASP.NET MVC", "Bootstrap", "Entity Framework", "SQL Server"]
        }
    ];

    const certificates = [
        {
            id: 1,
            title: "THE WEB DEVELOPMENT CHALLENGER TRACK",
            description: "Certified in Advanced WEB DEVELOPMENT by Udacity.",
            image: "img/certificates/Udacity Nanodegree Graduation Certificate.png",
            link: "https://www.udacity.com/certificate/e/51436012-4aec-11ed-bba3-13d109eae405",
        },

        {
            id: 2,
            title: "HTML & CSS",
            description: "Certified in completing learning HTML & CSS by ITI.",
            image: "img/certificates/HTML & CSS Course_Certificate_En conv 1.png",
            link: "https://drive.google.com/file/d/1XGzT8chS0TmfHkPA6KEHEd6vT8Q9gVoH/view?usp=drive_link",
        },

        {
            id: 3,
            title: "Python Certificate",
            description: "Certified in completing the Python course by ITI.",
            image: "img/certificates/Python Course_Certificate_En conv 1.png",
            link: "https://drive.google.com/file/d/1PlPWeSM0KCLPIHGjPnxIVXVzl9TjvpcK/view?usp=drive_link",
        },

        {
            id: 4,
            title: "Leadership Certificate",
            description: "Certified in completing the Effective Leadership course by HP LIFE.",
            image: "img/certificates/Effective Leadership conv 1.png",
            link: "https://drive.google.com/file/d/17bK79HgUcCIIvMmmkciGXdatKVEY6JsJ/view",
        },

        {
            id: 5,
            title: "AI Certificate",
            description: "Certified in completing the AI course by HP LIFE.",
            image: "img/certificates/AI for Beginners conv 1.png",
            link: "https://drive.google.com/file/d/1LvjzAO_EPHHiM-0eNTPpqBvhyTJFOAo-/view?usp=drive_link",
        }
    ];

    // Save data to local storage
    localStorage.setItem("projects", JSON.stringify(projects));
    localStorage.setItem("certificates", JSON.stringify(certificates));

    // Load projects and certificates from local storage
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const storedCertificates = JSON.parse(localStorage.getItem("certificates")) || [];

    // Render projects, certificates, and tech stack
    renderProjects(2); // Initial load with 2 projects
    renderCertificates();
    renderTechStack();

    // Add event listener to the "See More" / "Show Less" button
    const loadMoreButton = document.querySelector("#projects .btn");
    loadMoreButton.addEventListener("click", () => {
        visibleProjects = visibleProjects >= storedProjects.length ? 2 : visibleProjects + 2;
        renderProjects(visibleProjects);
    });

    // Dynamic typing effect for the main text
    const words = [
        "ROBUST .NET APPLICATIONS.",
        "SCALABLE CLOUD SOLUTIONS.",
        "SECURE BACKEND ARCHITECTURES.",
        "DYNAMIC MVC WEB PLATFORMS.",
        "INTERACTIVE FRONTEND EXPERIENCES.",
        "PERFORMANCE-OPTIMIZED DATABASES.",
        "RESPONSIVE E-COMMERCE SYSTEMS.",
        "INNOVATIVE ENTERPRISE SOFTWARE."
    ];

    const dynamicText = document.querySelector(".dynamic-text");
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentWord = words[wordIndex];
        const displayedText = currentWord.substring(0, charIndex);
        dynamicText.textContent = displayedText;

        if (!isDeleting && charIndex < currentWord.length) {
            charIndex++;
            setTimeout(typeEffect, 120);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(typeEffect, charIndex === 1 ? 300 : 60);
        } else if (!isDeleting) {
            setTimeout(() => {
                isDeleting = true;
                typeEffect();
            }, 1500);
        } else {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typeEffect, 300);
        }
    }

    // Start the first typing effect after the welcome screen 
    setTimeout(typeEffect, 500);

    // Smooth scrolling for stats
    const stats = document.querySelectorAll(".stat");
    stats.forEach(stat => {
        stat.addEventListener("click", () => {
            const targetId = stat.getAttribute("data-target");
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

// Function to render projects
let visibleProjects = 2;
function renderProjects(limit) {
    const projectsGrid = document.querySelector(".projects-grid");
    projectsGrid.innerHTML = "";

    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    storedProjects.slice(0, limit).forEach((project, index) => {
        const projectCard = document.createElement("div");
        projectCard.classList.add("project-card", "hidden");
        projectCard.innerHTML = `
            <img src="${project.image}" alt="${project.title}" />
            <h3>${project.title}</h3>
            <p>${project.description}</p>
        `;
        projectCard.addEventListener("click", () => openModal(project));
        projectsGrid.appendChild(projectCard);

        setTimeout(() => {
            projectCard.classList.remove("hidden");
        }, index * 150);
    });

    const loadMoreButton = document.querySelector("#projects .btn");
    loadMoreButton.textContent = limit >= storedProjects.length ? "Show Less" : "See More";
}

// Function to render certificates
function renderCertificates() {
    const certificatesGrid = document.querySelector(".certificates-grid");
    certificatesGrid.innerHTML = "";

    const storedCertificates = JSON.parse(localStorage.getItem("certificates")) || [];
    storedCertificates.forEach((certificate) => {
        const certificateCard = document.createElement("div");
        certificateCard.classList.add("certificate-card");
        certificateCard.innerHTML = `
            <img src="${certificate.image}" alt="${certificate.title}" />
            <h3>${certificate.title}</h3>
            <p>${certificate.description}</p>
        `;
        certificateCard.addEventListener("click", () => window.open(certificate.link, "_blank"));
        certificatesGrid.appendChild(certificateCard);
    });
}

// Function to render tech stack icons
function renderTechStack() {
    const techStackGrid = document.querySelector(".tech-stack-grid");
    techStackGrid.innerHTML = "";

    const techStacks = [
        { icon: "img/TechStack/html.svg", language: "HTML" },
        { icon: "img/TechStack/css.svg", language: "CSS" },
        { icon: "img/TechStack/javascript.svg", language: "JavaScript" },
        { icon: "img/TechStack/Csharp.svg", language: "C#" },
        { icon: "img/TechStack/Tsql.svg", language: "T-SQL" },
        { icon: "img/TechStack/Dotnet.svg", language: ".NET Core" },
        { icon: "img/TechStack/python.svg", language: "Python" },
        { icon: "img/TechStack/C+.svg", language: "C++" },
    ];

    techStacks.forEach((tech) => {
        const techStackItem = document.createElement("div");
        techStackItem.classList.add("tech-stack-item");
        techStackItem.innerHTML = `
            <img src="${tech.icon}" alt="${tech.language}" />
            <span>${tech.language}</span>
        `;
        techStackGrid.appendChild(techStackItem);
    });
}

// Function to open modal with project details
function openModal(project) {
    const modal = document.getElementById("project-modal");
    modal.querySelector(".modal-image").src = project.image;
    modal.querySelector(".modal-title").textContent = project.title;
    modal.querySelector(".modal-description").textContent = project.description;
    modal.querySelector(".modal-tech-stack").innerHTML = project.techStack.map(tech => `<span>${tech}</span>`).join("");
    const links = modal.querySelector(".modal-links");
    links.innerHTML = `
        <a href="${project.link}" class="btn" target="_blank">Live Demo</a>
        <a href="${project.github}" class="btn" target="_blank">GitHub</a>
    `;

    modal.classList.add("open");
}

// Close modal when clicking outside or on the close button
window.addEventListener("click", (event) => {
    const modal = document.getElementById("project-modal");
    if (event.target === modal || event.target.classList.contains("close-modal")) {
        modal.classList.remove("open");
    }
});

// Tabs functionality
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
let currentTabIndex = 0;

tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const newTabIndex = index;
        const newTabId = button.getAttribute("data-tab");
        const newTab = document.getElementById(newTabId);

        if (newTab.classList.contains("active")) return;

        console.log(`From ${currentTabIndex} to ${newTabIndex}`);

        // Update button states
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        const currentTab = document.querySelector(".tab-content.active");
        if (currentTab) {
            let exitDirection;
            let enterDirection;

            if (newTabIndex > currentTabIndex) {
                // right IN ORDER
                exitDirection = "left";
                enterDirection = "right";
            } else {
                //  left IN ORDER
                exitDirection = "right";
                enterDirection = "left";
            }

            console.log(`Exit: ${exitDirection}, Enter: ${enterDirection}`);

            // Remove any existing transition classes
            tabContents.forEach((tab) => {
                if (tab !== currentTab && tab !== newTab) {
                    tab.classList.remove("active", "exit-left", "exit-right", "enter-left", "enter-right");
                }
            });

            // Animate out current tab
            currentTab.classList.remove("active");
            currentTab.classList.add(`exit-${exitDirection}`);

            // Set up the new tab's initial position based on where it's coming from
            newTab.classList.remove("exit-left", "exit-right", "enter-left", "enter-right");
            newTab.style.transform = enterDirection === "right" ? "translateX(100%)" : "translateX(-100%)";
            newTab.style.opacity = "0";

            // Animate
            setTimeout(() => {
                newTab.classList.add(`enter-${enterDirection}`);
                newTab.classList.add("active");
            }, 50);

            // Clean up 
            setTimeout(() => {
                newTab.classList.remove(`enter-${enterDirection}`);
                currentTab.classList.remove(`exit-${exitDirection}`);
                currentTab.style.transform = exitDirection === "left" ? "translateX(-100%)" : "translateX(100%)";
                currentTab.style.opacity = "0";
            }, 500);
        } else {
            newTab.classList.add("active");
        }

        currentTabIndex = newTabIndex;
    });
});

// Contact form functionality
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    async function handleSubmit(event) {
        event.preventDefault(); // Prevent page reload

        let formData = new FormData(form);

        try {
            let response = await fetch("/", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                typeEffect("Thank you! Your message has been sent.", "success");
                form.reset();
            } else {
                typeEffect("Oops! Something went wrong. Please try again.", "error");
            }
        } catch (error) {
            typeEffect("Network error. Please check your connection.", "error");
        }
    }

    form.addEventListener("submit", handleSubmit);

    function typeEffect(message, statusClass) {
        formStatus.textContent = "";
        formStatus.className = statusClass;

        let charIndex = 0;
        function type() {
            if (charIndex < message.length) {
                formStatus.textContent += message.charAt(charIndex);
                charIndex++;
                setTimeout(type, 80); // Typing speed
            }
        }
        type();
    }
});

