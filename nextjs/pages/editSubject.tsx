import React, { useEffect, useState } from 'react';
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

editSubject.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function editSubject(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol:string}) {
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const router = useRouter();
  const api = `${props.protocol}//${props.hostname}`;
  const [ subject, setSubject ] = useState<Subject>();

  const back = async () => {
    return router.push('/subjects');
  }

  const edit = async (event: any) => {
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

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let subjectId = params.get('subject');
    let graphQuery = `(id: ${subjectId})`;
    graphQuery =
        `query {
                subject ${graphQuery} {
                  id
                  name
                  test_chamber
                  date_of_birth
                  score
                  alive
                  created_at
                }
              }
              `;
    axios.post(
        `${api}/graphql`,
        {
          query: graphQuery
        },
        { withCredentials: true }
    ).then(response => {
        const { subject = [] } = response.data.data;
        setSubject(subject as Subject);
    })
  }, [authenticated]);

    function handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setSubject({[name]: value} as Subject);
    }

  return (
    <Layout>
      <h1>Create User</h1>
      <section className={styles.content}>
        {subject && (
            <form onSubmit={edit}>
              <div>
                <label htmlFor="name">Name:</label>
                <input
                    onChange={handleChange}
                    type="text"
                    name="name"
                    value={subject.name}
                />
              </div>
              <div>
                <label htmlFor="test_chamber">Test Chamber:</label>
                <input
                    onChange={handleChange}
                    type="text"
                    name="test_chamber"
                    value={subject.test_chamber}
                />
              </div>
              <div>
                <label htmlFor="date_of_birth">DOB:</label>
                <input
                    onChange={handleChange}
                    type="text"
                    name="date_of_birth"
                    value={subject.date_of_birth}
                />
              </div>
              <div>
                <label htmlFor="score">Score:</label>
                <input
                    onChange={handleChange}
                    type="text"
                    name="score"
                    value={subject.score}
                />
              </div>
              <div>
                <label htmlFor="alive">Alive:</label>
                <input
                    onChange={handleChange}
                    type="checkbox"
                    name="alive"
                    checked={subject.alive}
                />
              </div>
              <div>
                  <label htmlFor="created_at">Created:</label>
                  <input
                      readOnly
                      type="text"
                      name="created_at"
                      value={subject.created_at}
                  />
              </div>
              <button type="submit">Edit Subject</button>
            </form>
        )}
      <button onClick={back}>Back</button>
      </section>
    </Layout>
  )
}
