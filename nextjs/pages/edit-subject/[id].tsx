import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Layout from '../../components/layout';
import styles from '../../styles/App.module.css';
import { useRouter } from 'next/router';
import {NextPage, NextPageContext} from 'next';
import { parseCookies, resolveApiHost, formatDate } from '../../helpers';
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
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [messageInfo, setMessageInfo] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    test_chamber: '',
    score: '',
    alive: false,
  });

  // Constructing the API endpoint
  const api = `${props.protocol}//${props.hostname}`;

  // Redirect if un-authenticated
  useEffect(() => {
    if (!authenticated) {
      router.push('/');
    }
  }, [authenticated]);

  useEffect(() => {
    if (id) {
      setIsLoadingData(true);

      // Get subject data on component mount
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
        setIsLoadingData(false);
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

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingUpdate(true);
    setMessageInfo({ message: '', type: '' });

    try {
      // Update subject data
      const response = await axios.post(
        `${api}/graphql`,
        {
          query: `
            mutation UpdateSubject($id: ID!, $name: String!, $dateOfBirth: DateTime!, $testChamber: Int!, $score: Int!, $alive: Boolean!) {
              updateSubject(
                id: $id
                name: $name
                date_of_birth: $dateOfBirth
                test_chamber: $testChamber
                score: $score
                alive: $alive
              ) {
                id
              }
            }
          `,
          variables: {
            id,
            name: formData.name,
            dateOfBirth: formatDate(formData.date_of_birth),
            testChamber: parseInt(formData.test_chamber),
            score: parseInt(formData.score),
            alive: formData.alive
          }
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      // Set success/error message
      if (response.data.errors) {
        setMessageInfo({ message: 'Error: ' + response.data.errors[0].message, type: 'error' });
      } else {
        setMessageInfo({ message: 'Subject updated successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      setMessageInfo({message: 'An error occurred', type: 'error'});
    }
    finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.main}>
            <h1>Edit Test Subject</h1>

              <div className={styles.content} style={{ paddingTop: 0 }}>
                {isLoadingData ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {/* Back Button */}
                    <div style={{ marginBottom: '15px' }}>
                      <Link href="/subjects" passHref>
                        <button>
                          Back
                        </button>
                      </Link>
                    </div>

                    {/* Form Message */}
                    {messageInfo.message && (
                      <div className={`${styles.formMessage} ${messageInfo.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
                        {messageInfo.message}
                      </div>
                    )}

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
                          required
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
                          required
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
                          required
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
                          required
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

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className={styles.content}
                        style={{ width: 'fit-content' }}
                        disabled={isLoadingUpdate}
                      >
                        {isLoadingUpdate ? 'Saving...' : 'Save'}
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
