require("dotenv").config({ path: "./passwordhide/password.env" });

const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const express = require("express");
const mysql = require("mysql2");
const app = express();
const cors = require("cors");

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"

  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(express.json()); // permet de convertir tout auto en format json

//modules pour l'authentification
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(express.json()); // permet de convertir tout auto en format json
app.use(cors());
app.use("/images", express.static(__dirname + "/images"));

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: dbPassword,
  port: dbPort,
  database: "marquise",
});

//Connection a la base de donnée
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
});

// Selectionner un utilisateur
app.get("/utilisateurs", (req, res, next) => {
  connection.query(
    "SELECT * FROM utilisateurs",
    function (error, results, fields) {
      if (error) {
        console.error(
          "Erreur lors de la récupération des utilisateurs :",
          error
        );
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération des utilisateurs" });
      } else {
        const jsonResults = JSON.parse(JSON.stringify(results));
        res.json(jsonResults);
      }
    }
  );
  next();
});
//Création d'un utilisateur
app.post("/utilisateurs", (req, res, next) => {
  const email = req.body.email;
  const mdp = req.body.mdp;
  connection.query(
    "INSERT INTO utilisateurs (email, mdp) VALUES (?, ?)",
    [email, mdp],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de l'insertion de l'utilisateur :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de l'insertion de l'utilisateur" });
        return;
      }
      res.json(result);
    }
  );
});

// Suppression d'un utilisateur de la base de données
app.delete("/utilisateurs", (req, res) => {
  const { id } = req.params;
  const query = "DELETE utilisateurs FROM utilisateurs WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du produit :", err);
      res.status(500).send("Erreur lors de la suppression du produit");
      return;
    }
    res.send("Utilisateur supprimé avec succès");
  });
});

// Ajouter un produit à la base de donnée
app.post("/produits", (req, res) => {
  connection.query(
    "INSERT INTO produits (nom, description, prix) VALUES ('abc', 'descript', 123)",
    function (error, results, fields) {
      if (error) {
        console.error("Erreur lors de l'insertion des produits :", error);
        res
          .status(500)
          .json({ error: "Erreur lors de l'insertion des produits" });
      } else {
        res.json(results);
      }
    }
  );
});

//Ajouter un article dans le panier!!
app.post("/panier", (req, res) => {
  const { quantite, utilisateur_id, produit_id } = req.body;
  connection.query(
    "INSERT INTO panier (quantite, utilisateur_id, produit_id) VALUES (?, ?, ?)",
    [quantite, utilisateur_id, produit_id],
    function (error, results, fields) {
      if (error) {
        console.error("Erreur lors de l'insertion des produits :", error);
        res
          .status(500)
          .json({ error: "Erreur lors de l'insertion des produits" });
      } else {
        res.json(results);
      }
    }
  );
});
app.get("/panier/:utilisateurId", (req, res) => {
  const {utilisateurId} = req.params;
  connection.query(
    "SELECT pn.*, p.* FROM panier AS pn JOIN produits AS p ON pn.produit_id = p.id WHERE pn.utilisateur_id = ?",
    [utilisateurId],
    (error, results, fields) => {
      if (error) {
        console.error("Erreur lors de la récupération du panier :", error);
        res.status(500).json({ error: "Erreur lors de la récupération du panier" });
      } else {
        const panier = results.map((row) => {
          return {
            id: row.id,
            quantite: row.quantite,
            produit: {
              id: row.produit_id,
              nom: row.nom,
              description: row.description,
              prix: row.prix,
              stock: row.stock,
              date: row.date
              // Ajoutez d'autres propriétés du produit que vous souhaitez récupérer
            }
          };
        });
        res.json(panier);
      }
    }
  );
});

// Mise à jour d'un produit dans la base de données
app.put("/produits/:id", (req, res) => {
  const { nom, prix, description } = req.body;
  const { id } = req.params;
  const query =
    "UPDATE produits SET nom = ?, prix = ?, description = ?,  = ?, WHERE id = ?";
  connection.query(query, [nom, prix, description, id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du produit :", err);
      res.status(500).send("Erreur lors de la mise à jour du produit");
      return;
    }
    res.send("Produit mis à jour avec succès");
  });
});

// Suppression d'un produit de la base de données
app.delete("/produits/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM produits WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la suppression du produit :", err);
      res.status(500).send("Erreur lors de la suppression du produit");
      return;
    }
    res.send("Produit supprimé avec succès");
  });
});

app.get("/produits", (req, res) => {
  connection.query("SELECT * FROM produits", function (error, results, fields) {
    if (error) {
      console.error("Erreur lors de la récupération des produits :", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des produits" });
    } else {
      const jsonResults = JSON.parse(JSON.stringify(results));
      res.json(jsonResults);
    }
  });
});

// ajouter image dans Mysql
const baseUrl = "http://localhost:3000/";
const imageUrl = baseUrl + "images/canape-2.jpeg";
const query = "UPDATE produits SET images = ? WHERE id = 2";
connection.query(query, [imageUrl], (error, results) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log("URL d'image ajoutée à la base de données avec succès");
});

//############################# LOGIN ################################

//configuration du secret (signature cookies et session)
const crypto = require("crypto");
const secret = crypto.randomBytes(32).toString("hex");

// Configurer le middleware pour les sessions et les cookies
app.use(cookieParser());
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
  })
);

// Définir une route de connexion
app.post("/login", (req, res) => {
  const { email, mdp } = req.body;
  console.log("Tentative de connexion avec l'email : " + email);

  const query = "SELECT * FROM utilisateurs WHERE email = ?";
  connection.query(query, [email], (error, results) => {
    if (error) {
      console.error("Erreur :", error);
      return res.status(500).send("Une erreur s'est produite lors de la connexion");
    }

    const utilisateur = results[0];
    console.log("Données de l'utilisateur :", utilisateur);

    if (!utilisateur) {
      console.error("Nom d'utilisateur incorrect");
      return res.status(401).send("Nom d'utilisateur incorrect");
    }

    bcrypt.compare(mdp, utilisateur.mdp, (err, isMatch) => {
      if (err) {
        console.error("Erreur :", err);
        return res.status(500).send("Une erreur s'est produite lors de la connexion");
      }

      if (isMatch) {
        req.session.user = utilisateur;
        return res.json(utilisateur);
        
      } else {
        console.error("Mot de passe incorrect");
        return res.status(401).send("Mot de passe incorrect");
      }
    });
  });

app.post("/login", (req, res) => {
  const { email, mdp } = req.body;
  console.log("Trying to login with " + email + "...");
  // Vérifier si le nom d'utilisateur et le mot de passe correspondent à la base de données
  connection.query(
    "SELECT * FROM utilisateurs WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log("erreur de connexion");
        throw err;
      }

      if (results.length === 0) {
        console.error("nom d'utilisateur incorrect");
        res.status(401).send("Nom d'utilisateur incorrect");
      } else {
        const utilisateur = results[0];
        // Vérifier si le mot de passe est correct en utilisant bcrypt
        bcrypt.compare(mdp, utilisateur.mdp, (err, isMatch) => {
          if (err) {
            console.log("pas de match");
            throw err;
          }

          if (isMatch) {
            // Définir une variable d'état dans la session pour suivre l'état de connexion
            req.session.isLoggedIn = true;
            res.send("Vous êtes connecté");
            console.log("Vous êtes connecté");
          } else {
            res.status(401).send("Mot de passe incorrect");
          }
        });
      }
    }

  );
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"

  );
});
});

// Définir une route pour récupérer les informations de l'utilisateur connecté
app.get("/user", requireAuth, (req, res) => {
  const user = req.session.user;
  res.json(user);
});


// Définir une route d'inscription
app.post("/register", (req, res) => {

  const { nom, prenom, email, mdp, adresse, cp, ville, pays, terms } = req.body;
  console.log("inscription de " + email + "...");

  // Hacher le mot de passe à l'aide de bcrypt
  bcrypt.hash(mdp, 10, (err, hashedPassword) => {
    if (err) {
      throw err;
    }

    // Insérer les informations d'utilisateur dans la base de données
    connection.query(
      "INSERT INTO utilisateurs (nom, prenom, email, mdp, adresse, cp, ville, pays,terms ) VALUES (?,?,?,?,?,?,?,?,?)",
      [nom, prenom, email, hashedPassword, adresse, cp, ville, pays, terms],
      (err) => {
        if (err) {
          console.log("erreur d'inscription'");
          throw err;
        }

        res.send("Inscription réussie");
        console.log("Inscription réussie");
      }
    );
  });
});

// Middleware pour vérifier si l'utilisateur est authentifié
function requireAuth(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = app;