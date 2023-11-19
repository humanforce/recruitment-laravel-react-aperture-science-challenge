import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Layout from '../../components/layout';
import styles from '../../styles/App.module.css';
import { useRouter } from 'next/router';
import {NextPage, NextPageContext} from 'next';
import { parseCookies, resolveApiHost } from '../../helpers';
import Link from 'next/link';
import axios from 'axios';

EditSubject.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function EditSubject(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol: string}) {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    test_chamber: '',
    score: '',
    alive: false,
  });

  const api = `${props.protocol}//${props.hostname}`;

  useEffect(() => {
    if (id) {
      setIsLoading(true);

      axios.post(
        `${api}/graphql`,
        {
          query: `
            query GetSubject($id: ID!) {
                subject(id: $id) {
                  name
                  date_of_birth
                  test_chamber
                  score
                  alive
                }
            }
          `,
          variables: { id }
        },
        { withCredentials: true }
      ).then(response => {
        // Update state with the fetched data
        const subjectData = response.data.data.subject;
        setFormData({
          name: subjectData.name,
          date_of_birth: subjectData.date_of_birth.split(' ')[0],
          test_chamber: subjectData.test_chamber,
          score: subjectData.score,
          alive: subjectData.alive,
        });
      })
      .catch(error => {
        console.error("Error fetching subject data", error);
      })
      .finally(() => {
        setIsLoading(false);
      })
    }
  }, [id, api]);

  // Handle form changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.main}>
            <h1>Edit Test Subject</h1>

              <div className={styles.content} style={{ paddingTop: 0 }}>

                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {/* Back Link */}
                    <div style={{ marginBottom: '15px' }}>
                      <Link href="/subjects" passHref>
                        <button>
                          Back
                        </button>
                      </Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Name Field */}
                      <div className={styles.inputGroup}>
                        <label>Name:</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      {/* DOB Field */}
                      <div className={styles.inputGroup}>
                        <label>Date of Birth:</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          max="2999-12-31"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Test Chamber Field */}
                      <div className={styles.inputGroup}>
                        <label>Test Chamber:</label>
                        <input
                          type="number"
                          name="test_chamber"
                          placeholder="Test Chamber"
                          value={formData.test_chamber}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Score Field */}
                      <div className={styles.inputGroup}>
                        <label>Score:</label>
                        <input
                          type="number"
                          name="score"
                          placeholder="Score"
                          value={formData.score}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Alive Checkbox */}
                      <div className={styles.inputGroup}>
                        <label>Alive:</label>
                        <input
                          type="checkbox"
                          name="alive"
                          checked={formData.alive}
                          onChange={handleChange}
                        />
                      </div>

                      <button
                        type="submit"
                        className={styles.content}
                        style={{ width: 'fit-content' }}
                      >
                        Update Subject
                      </button>
                    </form>
                  </>
                )}
              </div>
          </div>
        </div>
      </Layout>
  );
}