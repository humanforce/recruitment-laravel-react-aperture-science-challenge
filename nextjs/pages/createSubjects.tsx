import React, { useState } from 'react'
import { NextPage, NextPageContext } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios';
import { parseCookies, resolveApiHost } from "../helpers/"
import Layout from "../components/layout"
import styles from "../styles/App.module.css";

interface Subject {
  id: number,
  name: string,
  test_chamber?: number,
  date_of_birth?: string,
  score?: number,
  alive?: boolean,
  created_at?: string,
  updated_at?: string
}

createUser.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function createUser(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol:string}) {
  const router = useRouter();
  const api = `${props.protocol}//${props.hostname}`;

  const back = async () => {
    return router.push('/subjects');
  }

  const create = async (event: any) => {
    event.preventDefault()
    axios.post(
        `${api}/api/createSubject`,
        {
          name: event.target.name.value,
          test_chamber: event.target.test_chamber.value,
          date_of_birth: event.target.date_of_birth.value,
          score: event.target.score.value,
          alive: event.target.alive.value
        },
        {withCredentials: true}
    )
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <Layout>
      <h1>Create User</h1>
      <section className={styles.content}>
      <form onSubmit={create}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
              type="text"
              name="name"
          />
        </div>
        <div>
          <label htmlFor="test_chamber">Test Chamber:</label>
          <input
              type="text"
              name="test_chamber"
          />
        </div>
        <div>
          <label htmlFor="date_of_birth">DOB:</label>
          <input
              type="date"
              name="date_of_birth"
          />
        </div>
        <div>
          <label htmlFor="score">Score:</label>
          <input
              type="text"
              name="score"
          />
        </div>
        <div>
          <label htmlFor="alive">Alive:</label>
          <input
              type="checkbox"
              name="alive"
          />
        </div>
        <button type="submit">Create Subject</button>
      </form>
      <button onClick={back}>Back</button>
      </section>
    </Layout>
  )
}
