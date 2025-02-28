<div style="display: flex; align-items: center; gap: 20px;">
    <div style="border-radius: 50%; height: 50px; width: 50px; overflow: hidden;">
        <img src="./src/images/logo.jpg" alt="Logo rkllama" style="width: 100%; height: 100%; object-fit: cover; border: 2px solid #000;">
    </div>
    <strong style="font-size: 24px; font-weight: bold;">Rkllama Web Client</strong>
</div>
</br>

Bienvenue sur le rkllama Web Client, une interface web légère pour interagir avec rkllama, un outil permettant d'exécuter des modèles de langage sur les NPUs Rockchip.


## Présentation

Le rkllama Web Client offre une interface web conviviale pour rkllama, optimisée pour le matériel Rockchip. Idéal pour les développeurs travaillant avec des modèles de langage sur NPUs.


---
![Image](./src/images/Screenshot%20from%202025-02-27%2023-30-18.png)
![Image](./src/images/Screenshot%20from%202025-02-27%2023-30-25.png)
![Image](./src/images/Screenshot%20from%202025-02-27%2023-30-55.png)

<video width="320" height="240" controls>
  <source src="./src/images/Screencast%20from%202025-02-27%2022-43-01.webm" type="video/mp4">
</video>


## Prérequis

- Matériel compatible avec les NPUs Rockchip (ex. : RK3588 ou RK3576).
- rkllama installé et fonctionnel.
- Système Linux (ce guide cible Linux, ex. : Ubuntu/Debian).
- Git (optionnel).

---

## Installation de rkllama

1. Clonez le dépôt rkllama :
   ```bash
   git clone https://github.com/NotPunchnox/rkllama.git
   cd rkllama
   ```

2. Installer rkllama ( documentation: https://github.com/NotPunchnox/rkllama)

**Remarque** : Une version Docker de rkllama existe.

---

## Lancer le serveur web rkllama

Utilisez le script Bash `start.sh` pour installer Node.js et `serve` si nécessaire, puis démarrer le serveur web sur un port disponible (affiché même en cas de conflit).

1. Rendez le script exécutable :
   ```bash
   chmod +x start.sh
   ```

2. Lancez le serveur :
   ```bash
   ./start.sh
   ```

   Le script affichera le port utilisé (par exemple, `8080` ou le suivant si occupé). Accédez à `http://localhost:<port>` pour utiliser le client web.

---

## Utilisation

- Ouvrez `http://localhost:<port>` dans un navigateur.
- Interagissez avec rkllama via l’interface web pour exécuter des modèles de langage.
- Consultez la documentation rkllama pour des configurations avancées.

---

## Contribution

Contributions bienvenues ! Forkez le dépôt, faites vos modifications, et soumettez une pull request.
---

## Licence

Sous licence Apache2. Consultez [LICENSE](LICENSE) pour plus d’informations.