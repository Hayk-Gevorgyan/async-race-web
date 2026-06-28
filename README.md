# Async Race

Single-page application for managing a garage of cars and running drag races.

**Deployed:** https://async-race-web-51vh.vercel.app/

> The app connects to a local mock server at `http://127.0.0.1:3000`. To use the deployed version or run locally, start the [async-race-api](https://github.com/mikhama/async-race-api) server first.

## Run locally

```bash
npm install
npm run dev
```

## Implementation checklist

### Basic Structure
#### Two views: Garage and Winners, switchable via nav
#### State preserved when switching between views
#### Garage view: header with controls + paginated car list
#### Winners view: sortable table with pagination

### Garage
#### Create a car (name + color)
#### Update a car (name + color)
#### Delete a car (also removed from winners)
#### Color picker with hex preview
#### Generate 100 random cars
#### Pagination — 7 cars per page

### Race
#### Start/stop individual cars
#### Start Race — all cars race simultaneously
#### Reset Race — all cars return to start
#### Winner banner with name and time (auto-dismisses)
#### Winner persisted to server (the best time updated if faster)
#### Race condition fix — winner set exactly once per race

### Winners
#### Table: №, car icon, name, wins, best time
#### Sort by wins (ASC/DESC)
#### Sort by the best time (ASC/DESC)
#### Pagination — 10 winners per page

### Code quality
#### TypeScript strict mode
#### ESLint with Airbnb config — covers all formatting rules Prettier would add (quotes, semicolons, indent, line length), making a separate Prettier setup redundant and a potential source of rule conflicts
#### CSS custom properties (design tokens)
#### React Context for shared state

## Estimated score

| Category        | Max     | Est.    |
|-----------------|---------|---------|
| Basic Structure | 80      | 80      |
| Garage          | 90      | 85      |
| Winners         | 50      | 50      |
| Race            | 170     | 150     |
| Prettier/ESLint | 10      | 10      |
| Code Quality    | 100     | ?       |
| **Total**       | **500** | **375** |
