"use server";

import { Config, configSchema, explanationsSchema, Result } from "@/lib/types";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Heroku's SSL connection
  },
});

export const generateQuery = async (input: string) => {
  "use server";
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: `You are a SQL (postgres) and data visualization expert. Your job is to help the user write a SQL query to retrieve the data they need. Ensure all table and column names with uppercase letters are enclosed in double quotes to preserve their case sensitivity. Do not lowercase identifiers. The table schema is as follows:



      membership_details (
      user_id INTEGER,
      Email VARCHAR,
      Athlete Name VARCHAR(255),
      client_name VARCHAR(255),
      Membership VARCHAR(255),
      Membership Category VARCHAR(255),
      customer_id INTEGER,
      Total Time As Member (days),
      UNIQUE (user_id, Membership)
);


revenue_report (
 customer_id     | bigint                      |           |          | 
 purchased_at    | timestamp without time zone |           |          | 
 amount          | double precision            |           |          | 
 discount_amount | double precision            |           |          | 
 athlete_name    | text                        |           |          | 
 product_type    | text                        |           |          | 
 buyer_name      | text                        |           |          | 
 buyer_email     | text                        |           |          | 
 product         | text                        |           |          | 
 source_type     | text 
);

cancelations (
  customer_id BIGINT,
  Business TEXT,
  Athlete Name TEXT,
  Client Name TEXT,
  Email TEXT,
  Event Type TEXT,
  Event TEXT,
  Session Start TIMESTAMP WITHOUT TIME ZONE,
  Cancelation Executed By Type TEXT,
  Cancelation Executed By TEXT,
  Cancellation Time TIMESTAMP WITHOUT TIME ZONE,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Cancellation Timing DOUBLE PRECISION,
  Cancelation Category TEXT,
  Cancelled Time TEXT,
  Session Start Time TEXT,
  price DOUBLE PRECISION,
  Membership TEXT,
  Member Status TEXT,
  Amount Lost DOUBLE PRECISION
);

clients (
  created_at TIMESTAMP WITHOUT TIME ZONE,
  client_id BIGINT,
  type TEXT,
  first_name TEXT,
  last_name TEXT,
  last_login_at TIMESTAMP WITHOUT TIME ZONE,
  gender TEXT,
  age DOUBLE PRECISION,
  managed_by_status BIGINT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  customer TEXT,
  customer_id BIGINT,
  time_zone TEXT
);

events (
  id BIGINT,
  description TEXT,
  title TEXT,
  price DOUBLE PRECISION,
  event_type TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  single_session_price DOUBLE PRECISION,
  sport_type TEXT,
  seasons TEXT,
  scheduled_date DATE,
  customer_id BIGINT
);

customers (
  customer_id BIGINT,
  customer_name TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  time_zone TEXT,
  business_type TEXT,
  sports_offered TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  number_of_locations BIGINT
);

noshows (
  customer_id BIGINT,
  Business TEXT,
  Athlete Name TEXT,
  Client Name TEXT,
  Email TEXT,
  Event Type TEXT,
  Event TEXT,
  Session Start TIMESTAMP WITHOUT TIME ZONE,
  Activity Time TIMESTAMP WITHOUT TIME ZONE,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Session Start Time TEXT
);

registrations (
  staff_status TEXT,
  starts_at TIMESTAMP WITHOUT TIME ZONE,
  ends_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  event TEXT,
  schedule_type BIGINT,
  sport_type TEXT,
  event_type TEXT,
  client_id BIGINT,
  staff_id DOUBLE PRECISION,
  resource_id DOUBLE PRECISION,
  resource TEXT,
  customer_id BIGINT,
  time_zone TEXT
);

staff_availability_schedule (
  staff_id BIGINT,
  customer_id BIGINT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  date_specific_daytimes TEXT,
  exclusions TEXT,
  daytimes TEXT
);

staff_payroll (
  Session Payroll DOUBLE PRECISION,
  Staff Name TEXT,
  Hourly Payroll DOUBLE PRECISION,
  customer_id BIGINT,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Year DOUBLE PRECISION
);


Exclude rows with NULL in the Total Time As Member (days) column. 

    Only retrieval queries are allowed.

    To handle NULL values in the discount_amount column and treat them as 0 during calculations, use the COALESCE() function. This function replaces NULL values with a specified default, in this case, 0. 

    For total time as customer, round to nearest whole number and add in the column title ONLY, add "days" behind it.

    For things like industry, company names and other string fields, use the ILIKE operator and convert both the search term and the field to lowercase using LOWER() function. For example: LOWER(industry) ILIKE LOWER('%search_term%').

    Note: select_investors is a comma-separated list of investors. Trim whitespace to ensure you're grouping properly. Note, some fields may be null or have only one value.
    When answering questions about a specific field, ensure you are selecting the identifying column (ie. what is Vercel's valuation would select company and valuation').

    The industries available are:
    - healthcare & life sciences
    - consumer & retail
    - financial services
    - enterprise tech
    - insurance
    - media & entertainment
    - industrials
    - health

    If the user asks for a category that is not in the list, infer based on the list above.

    Note: valuation is in billions of dollars so 10b would be 10.0.
    Note: if the user asks for a rate, return it as a decimal. For example, 0.1 would be 10%.

    If the user asks for 'over time' data, return by year.

    EVERY QUERY SHOULD RETURN QUANTITATIVE DATA THAT CAN BE PLOTTED ON A CHART! There should always be at least two columns. If the user asks for a single column, return the column and the count of the column. If the user asks for a rate, return the rate as a decimal. For example, 0.1 would be 10%.
    `,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}`,
      schema: z.object({
        query: z.string(),
      }),
    });
    return result.object.query;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to generate query");
  }
};

export const runGenerateSQLQuery = async (query: string) => {
  "use server";

  // Validate that only SELECT queries are allowed
  if (
    !query.trim().toLowerCase().startsWith("select") ||
    query.trim().toLowerCase().includes("drop") ||
    query.trim().toLowerCase().includes("delete") ||
    query.trim().toLowerCase().includes("insert") ||
    query.trim().toLowerCase().includes("update") ||
    query.trim().toLowerCase().includes("alter") ||
    query.trim().toLowerCase().includes("truncate") ||
    query.trim().toLowerCase().includes("create") ||
    query.trim().toLowerCase().includes("grant") ||
    query.trim().toLowerCase().includes("revoke")
  ) {
    throw new Error("Only SELECT queries are allowed");
  }

  let client;
  try {
    client = await pool.connect(); // Attempt to connect to the database
  } catch (connectionError: any) {
    console.error(
      "Failed to connect to the database:",
      connectionError.message
    );
    throw new Error(
      "Database connection failed. Please check your database configuration."
    );
  }

  try {
    const data = await client.query(query); // Run the SQL query
    return data.rows as Result[];
  } catch (queryError: any) {
    console.error("Database query failed:", queryError.message);
    throw new Error(
      "Failed to execute query. Please check the query syntax and database state."
    );
  } finally {
    client.release(); // Release the client back to the pool
  }
};

export const explainQuery = async (input: string, sqlQuery: string) => {
  "use server";
  try {
    const result = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        explanations: explanationsSchema,
      }),
      system: `You are a SQL (postgres) expert. Your job is to explain to the user write a SQL query you wrote to retrieve the data they asked for. The table schema is as follows:
   
      membership_details (
      user_id INTEGER,
      Email VARCHAR,
      Athlete Name VARCHAR(255),
      client_name VARCHAR(255),
      Membership VARCHAR(255),
      Membership Category VARCHAR(255),
      customer_id INTEGER,
      Total Time As Member (days),
      UNIQUE (user_id, Membership)
);

cancelations (
  customer_id BIGINT,
  Business TEXT,
  Athlete Name TEXT,
  Client Name TEXT,
  Email TEXT,
  Event Type TEXT,
  Event TEXT,
  Session Start TIMESTAMP WITHOUT TIME ZONE,
  Cancelation Executed By Type TEXT,
  Cancelation Executed By TEXT,
  Cancellation Time TIMESTAMP WITHOUT TIME ZONE,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Cancellation Timing DOUBLE PRECISION,
  Cancelation Category TEXT,
  Cancelled Time TEXT,
  Session Start Time TEXT,
  price DOUBLE PRECISION,
  Membership TEXT,
  Member Status TEXT,
  Amount Lost DOUBLE PRECISION
);


revenue_report (
  customer_id     | bigint                      |           |          | 
  purchased_at    | timestamp without time zone |           |          | 
  amount          | double precision            |           |          | 
  discount_amount | double precision            |           |          | 
  athlete_name    | text                        |           |          | 
  product_type    | text                        |           |          | 
  buyer_name      | text                        |           |          | 
  buyer_email     | text                        |           |          | 
  product         | text                        |           |          | 
  source_type     | text 
 );

 clients (
  created_at TIMESTAMP WITHOUT TIME ZONE,
  client_id BIGINT,
  type TEXT,
  first_name TEXT,
  last_name TEXT,
  last_login_at TIMESTAMP WITHOUT TIME ZONE,
  gender TEXT,
  age DOUBLE PRECISION,
  managed_by_status BIGINT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  customer TEXT,
  customer_id BIGINT,
  time_zone TEXT
);

events (
  id BIGINT,
  description TEXT,
  title TEXT,
  price DOUBLE PRECISION,
  event_type TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  single_session_price DOUBLE PRECISION,
  sport_type TEXT,
  seasons TEXT,
  scheduled_date DATE,
  customer_id BIGINT
);

customers (
  customer_id BIGINT,
  customer_name TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  time_zone TEXT,
  business_type TEXT,
  sports_offered TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  number_of_locations BIGINT
);

noshows (
  customer_id BIGINT,
  Business TEXT,
  Athlete Name TEXT,
  Client Name TEXT,
  Email TEXT,
  Event Type TEXT,
  Event TEXT,
  Session Start TIMESTAMP WITHOUT TIME ZONE,
  Activity Time TIMESTAMP WITHOUT TIME ZONE,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Session Start Time TEXT
);

registrations (
  staff_status TEXT,
  starts_at TIMESTAMP WITHOUT TIME ZONE,
  ends_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  event TEXT,
  schedule_type BIGINT,
  sport_type TEXT,
  event_type TEXT,
  client_id BIGINT,
  staff_id DOUBLE PRECISION,
  resource_id DOUBLE PRECISION,
  resource TEXT,
  customer_id BIGINT,
  time_zone TEXT
);

staff_availability_schedule (
  staff_id BIGINT,
  customer_id BIGINT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  updated_at TIMESTAMP WITHOUT TIME ZONE,
  date_specific_daytimes TEXT,
  exclusions TEXT,
  daytimes TEXT
);

staff_payroll (
  Session Payroll DOUBLE PRECISION,
  Staff Name TEXT,
  Hourly Payroll DOUBLE PRECISION,
  customer_id BIGINT,
  Date TIMESTAMP WITHOUT TIME ZONE,
  Year DOUBLE PRECISION
);

    When you explain you must take a section of the query, and then explain it. Each "section" should be unique. So in a query like: "SELECT * FROM unicorns limit 20", the sections could be "SELECT *", "FROM UNICORNS", "LIMIT 20".
    If a section doesnt have any explanation, include it, but leave the explanation empty.

    `,
      prompt: `Explain the SQL query you generated to retrieve the data the user wanted. Assume the user is not an expert in SQL. Break down the query into steps. Be concise.

      User Query:
      ${input}

      Generated SQL Query:
      ${sqlQuery}`,
    });
    return result.object;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to generate query");
  }
};

export const generateChartConfig = async (
  results: Result[],
  userQuery: string
) => {
  "use server";
  const system = `You are a data visualization expert. `;

  try {
    const { object: config } = await generateObject({
      model: openai("gpt-4o"),
      system,
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query.
      For multiple groups use multi-lines.

      Here is an example complete config:
      export const chartConfig = {
        type: "pie",
        xKey: "month",
        yKeys: ["sales", "profit", "expenses"],
        colors: {
          sales: "#4CAF50",    // Green for sales
          profit: "#2196F3",   // Blue for profit
          expenses: "#F44336"  // Red for expenses
        },
        legend: true
      }

      User Query:
      ${userQuery}

      Data:
      ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    });

    const colors: Record<string, string> = {};
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`;
    });

    const updatedConfig: Config = { ...config, colors };
    return { config: updatedConfig };
  } catch (e) {
    // @ts-expect-errore
    console.error(e.message);
    throw new Error("Failed to generate chart suggestion");
  }
};
