# Taskify: Task management API

Taskify is my implementation of the standard Task Management API project.
It is implemented using nodejs and expressjs. It uses mongodb as the backend
and mongoose is used as the ODM. Unit and Integration tests are written using
mocha and chai with several mocking libraries.

# How to run the app locally

- Clone the repo
- Install node dependencies
```bash
npm install
```
- Create a .env file at the root of the project with the DB URL
```
DB_URL='mongodb://127.0.0.1:27017/Taskify'
```
- Run the app using the npm command
```bash
npm run dev
```

# Unit Testing

Unit tests can be run by running the following command.

```bash
npm test
```

# Integration Testing

Integration tests can be run by running the following command.

```bash
npm run integration
```

# Get Test Coverage

To get test coverage run the following command

```bash
npm run coverge
```
