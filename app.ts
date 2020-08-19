import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { connectToDatabase } from './helpers/dbFunctions';

useContainer(Container);

const app = createExpressServer({
    controllers: [__dirname + "/controllers/*.js"],
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on ${port}`);
    connectToDatabase().then(() => {
        console.log('Connected to database');
    });
});



