# Trevi

**Trevi** is a self-hosted application for tracking restaurant visits, writing reviews, and maintaining a wishlist of places to try. Built for food enthusiasts who want to organize their culinary experiences—individually or with friends and family.

## 🛠️ Tech Stack

| Component      | Technologies                                                        |
| -------------- | ------------------------------------------------------------------- |
| **Backend**    | Laravel, Spatie Query Builder, JSON API Pagination, Laravel Sanctum |
| **Frontend**   | React, TanStack Start, ShadCN                                       |
| **Database**   | PostgreSQL                                                          |
| **Deployment** | Docker, Kubernetes                                                  |
| **Auth**       | Laravel Sanctum (cookie-based)                                      |

## 📂 Project Structure

This repository is organized into two main components, each with its own detailed documentation:

- **[`/client`](./client)** – Frontend (React)
- **[`/server`](./server)** – Backend (Laravel)

Refer to the READMEs in each directory for setup, development, and configuration instructions.

## 💻 Development

### Local Environment

A [`docker-compose.yml`](./docker-compose.yml) file is included in the root directory to spin up a **PostgreSQL** database for local development. Run it with:

```bash
docker compose up -d
```

For detailed setup instructions for the **client** and **server**, refer to their respective READMEs:

- [Client Setup](./client/README.md)
- [Server Setup](./server/README.md)

### VSCode Workspace

For an optimized development experience, open the [`trevi.code-workspace`](./trevi.code-workspace) file in VSCode. This workspace configuration:

- Organizes the project into separate folders (client/server) for better navigation.
- Enables Laravel-specific extensions (e.g., **Artisan helper**, **Laravel IntelliSense**) to work seamlessly in the `server` folder.
- Automatically sets the `DB_PASSWORD` environment variable in integrated terminals.
- Configures **conventional commit scopes** for consistent commit messages.
- Adds a **SQLTools plugin connection** to interact with the PostgreSQL database directly from VSCode (view tables, run queries, etc.).

## 🚀 Self-hosting

Trevi is designed to be self-hosted. Below are the deployment options.

### 📦 Container Images

All Docker images are automatically built and published to **GitHub Container Registry (GHCR)** via GitHub Actions:

- **[trevi-php-fpm](https://github.com/Dan6erbond/trevi/pkgs/container/trevi-php-fpm)** – PHP-FPM backend
- **[trevi-nginx](https://github.com/Dan6erbond/trevi/pkgs/container/trevi-nginx)** – Nginx web server
- **[trevi-client](https://github.com/Dan6erbond/trevi/pkgs/container/trevi-client)** – React frontend

<details>

<summary>### 🐳 Docker Compose</summary>

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: trevi
      POSTGRES_USER: trevi
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  php-fpm:
    image: ghcr.io/dan6erbond/trevi-php-fpm
    environment:
      DB_CONNECTION: pgsql
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: trevi
      DB_USERNAME: trevi
      DB_PASSWORD: yourpassword
      APP_KEY: your-app-key
    volumes:
      - storage:/var/www/storage
    expose:
      - "9000"

  nginx:
    image: ghcr.io/dan6erbond/trevi-nginx
    network_mode: "service\:php-fpm"
    ports:
      - "8000:80"
    depends_on:
      - php-fpm
      - postgres

  client:
    image: ghcr.io/dan6erbond/trevi-client
    environment:
      VITE_SERVER_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - nginx

volumes:
  postgres_data:
  storage:
```

</details>

<details>

<summary>### ⚙️ Kubernetes</summary>

```yaml
---
# 1. Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: trevi
---
# 2. Storage PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: trevi-storage
  namespace: trevi
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 15Gi
  storageClassName: local-path
---
# 3. ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: trevi-env
  namespace: trevi
data:
  APP_KEY: "<your-app-key>"
  DB_CONNECTION: "pgsql"
  DB_HOST: "<your-postgres-host>"
  DB_PORT: "5432"
  DB_DATABASE: "trevi"
  DB_USERNAME: "<your-db-user>"
  DB_PASSWORD: "<your-db-password>"
---
# 4. Server Deployment (PHP-FPM + Nginx)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trevi-server
  namespace: trevi
spec:
  replicas: 1
  selector:
    matchLabels:
      app: trevi-server
  template:
    metadata:
      labels:
        app: trevi-server
    spec:
      containers:
        - name: php-fpm
          image: ghcr.io/dan6erbond/trevi-php-fpm
          envFrom:
            - configMapRef:
                name: trevi-env
          volumeMounts:
            - name: storage
              mountPath: /var/www/storage
        - name: nginx
          image: ghcr.io/dan6erbond/trevi-nginx
          ports:
            - containerPort: 80
      volumes:
        - name: storage
          persistentVolumeClaim:
            claimName: trevi-storage
---
# 5. Server Service
apiVersion: v1
kind: Service
metadata:
  name: trevi-server
  namespace: trevi
spec:
  type: ClusterIP
  selector:
    app: trevi-server
  ports:
    - port: 80
      targetPort: 80
---
# 6. Client Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trevi-client
  namespace: trevi
spec:
  replicas: 1
  selector:
    matchLabels:
      app: trevi-client
  template:
    metadata:
      labels:
        app: trevi-client
    spec:
      containers:
        - name: client
          image: ghcr.io/dan6erbond/trevi-client
          env:
            - name: VITE_SERVER_URL
              value: "http://trevi-server"
          ports:
            - containerPort: 3000
---
# 7. Client Service
apiVersion: v1
kind: Service
metadata:
  name: trevi-client
  namespace: trevi
spec:
  type: ClusterIP
  selector:
    app: trevi-client
  ports:
    - port: 3000
      targetPort: 3000
---
# 8. Ingress (Traefik)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: trevi
  namespace: trevi
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt
spec:
  rules:
    - host: trevi.your-domain.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: trevi-server
                port:
                  number: 80
          - path: /sanctum
            pathType: Prefix
            backend:
              service:
                name: trevi-server
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: trevi-client
                port:
                  number: 3000
```

</details>

## 📜 License

This project is open-source and licensed under the MIT License.

## ⚠️ Disclaimers

- **Early Development:** Trevi is currently in its early stages. Expect bugs, missing features, and breaking changes.
- **Use at Your Own Risk:** This software is provided as-is without warranty. The maintainers are not responsible for any data loss or issues arising from its use.
- **AI Assistance:** Parts of the codebase (especially the frontend) were generated with the help of AI tools. All code has been reviewed and tested, but please report any issues you encounter.
- **Self-Hosting Responsibility:** You are responsible for securing your deployment, including database backups, authentication, and network configuration.
