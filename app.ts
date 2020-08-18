import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";

useContainer(Container);

const app = createExpressServer({
    controllers: [__dirname + "/controllers/*.js"],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('connected to server');
});



