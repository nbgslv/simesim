import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env(
        'DATABASE_HOST',
        'app-fa2e82df-c89e-408f-b45d-800e2b94424f-do-user-12952928-0.b.db.ondigitalocean.com'
      ),
      port: env.int('DATABASE_PORT', 25060),
      database: env('DATABASE_NAME', 'db-staging'),
      user: env('DATABASE_USERNAME', 'db-staging'),
      password: env('DATABASE_PASSWORD', 'AVNS_pyObam4Cr8mGWL_jWHb'),
      schema: env('DATABASE_SCHEMA', 'public'), // Not required
      ssl: {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      },
    },
    debug: true,
  },
});
