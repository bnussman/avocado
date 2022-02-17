# 🥑 Avocado

A full-stack **social media app** for my Capstone Project 🎓

## 💻 Local Development

### Dependencies

```
sudo apt-get install nodejs
sudo apt-get install npm
```

```
sudo npm install --global pnpm
sudo npm install --global expo-cli
```

### Running Locally

Clone this repository
```
git clone https://gitlab.nussman.us/banks/avocado.git
```

Go into the projects directory
```
cd avocado
```

Install dependencies
```
pnpm install
```

To run the development envrionment use
```
pnpm dev
```

## 💾  Spin up a local Database

```
docker-compose up -d db
```

## 🖥️  Build for Production

```
pnpm build
```

### Services running for local development

| Service    | URL                           |
|------------|-------------------------------|
| Website    | http://localhost:3000         |
| API        | http://localhost:3001/graphql |
| Expo       | http://localhost:19002        |
| Expo (Web) | http://localhost:19006        |
| MySQL      | mysql://root@db:3306/avocado  |

## ️⚠️️ Troubleshooting

Use `yarn clean` to clear all dependencies in the project's repository

Leave an [issue](https://gitlab.nussman.us/banks/avocado/-/issues) to get support on installing, developing, and running locally.

## 🚓 License

The project is licensed under the Apache 2.0 Licence 
