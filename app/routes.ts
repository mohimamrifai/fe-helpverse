import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // home (admin, eo, user)
    route("login", "routes/login.tsx"), // login
    route("register/event-organizer", "routes/register/event-organizer.tsx"), // register event organizer
    route("event/create", "routes/event/create.tsx"), // create event
    // route("event/create/seat-arrangement", "routes/event/create/seat-arrangement.tsx"), // seat arrangement
    route("event/:id/book", "routes/event.$id.book.tsx"), // book event
    route("event/:id/payment", "routes/event.$id.payment.tsx"), // payment
    route("event/:id", "routes/event.tsx"), // event detail
    route("my-bookings", "routes/my-bookings.tsx"), // my booking
] satisfies RouteConfig;
