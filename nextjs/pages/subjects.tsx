
import React, { useEffect, useState } from 'react';
import { NextPage, NextPageContext  } from 'next'
import { useCookies } from "react-cookie"
import styles from '../styles/App.module.css'
import axios from 'axios';
import { parseCookies, resolveApiHost } from "../helpers/"
import { useRouter } from 'next/router'
import Layout from "../components/layout"

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

interface PaginatorInfo {
  total: number;
  currentPage: number;
  lastPage: number;
}

interface SubjectData {
  data: Subject[];
  paginatorInfo: PaginatorInfo;
}

Subjects.getInitialProps = ({ req, res }: NextPageContext) => {
  const cookies = parseCookies(req);
  const { protocol, hostname } = resolveApiHost(req);
  return { XSRF_TOKEN: cookies["XSRF-TOKEN"], hostname, protocol };
}

export default function Subjects(props: NextPage & {XSRF_TOKEN: string, hostname: string, protocol:string}) {
  const router = useRouter();
  const [ authenticated, setAuth ] = useState<Boolean>(!!props.XSRF_TOKEN);
  const [ subjects, setSubjects ] = useState<Array<Subject>>();
  const [ message, setErrorMessage ] = useState<string>('');
  const [cookie, setCookie, removeCookie] = useCookies(["XSRF-TOKEN"])
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [ paginatorInfo, setPaginatorInfo ] = useState<PaginatorInfo>({
    total: 0,
    currentPage: 1,
    lastPage: 1
  });

  const api = `${props.protocol}//${props.hostname}`

  const logout = async () => {
    try {
      await axios({
        method: "post",
        url: `${api}/logout`,
        withCredentials: true
      }).then((response) => {
        removeCookie("XSRF-TOKEN");
        setAuth(!(response.status === 204))
        return router.push('/');
      })
    } catch (e) {
      console.log(e);
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) {
      return '???'
    }
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
  }

  const sortSubjects = (key: keyof Subject) => {
    if (!subjects) return;

    const sortedSubjects = [...subjects].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      // Convert date strings to timestamps for comparison
      if (key === 'date_of_birth') {
        valueA = valueA ? new Date(valueA as string).getTime() : 0;
        valueB = valueB ? new Date(valueB as string).getTime() : 0;
      }

      // Compare numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Compare strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      // Default comparison for other types
      return 0;
    });

    setSubjects(sortedSubjects);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    if (authenticated) {
      // Fetch first page data on initial load
      fetchPageData(1);
    } else {
      router.push('/');
    }
  }, [authenticated]);

  const fetchPageData = (page: number) => {
    setIsLoading(true);
    axios.post(
        `${api}/graphql`,
        {
          query: `
        query GetSubjects($page: Int!) {
          subjects(page: $page) {
            data {
              id
              name
              test_chamber
              date_of_birth
              score
              alive
              created_at
            }
            paginatorInfo {
              total
              currentPage
              lastPage
            }
          }
        }
      `,
          variables: {
            page,
          }
        },
        { withCredentials: true }
    ).then(response => {
      const { subjects } = response.data?.data || {};
      if (subjects) {
        setSubjects(subjects.data);
        setPaginatorInfo(subjects.paginatorInfo);
        console.log(paginatorInfo);
      }
    }).catch((e) => {
      // Handle error
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <Layout>
      <h1>Testing Subjects</h1>
      <section className={styles.content}>
        {message && (
          <p data-testid="error-msg">{message}</p>
        )}

        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <>
              {subjects && subjects.length > 0 && (
                  <table data-testid="subjects-table">
                    <thead>
                    <tr>
                      <td>ID</td>
                      <td>Name</td>
                      <td onClick={() => sortSubjects('date_of_birth')} className={styles.sortableHeader}>
                        DOB {sortOrder === 'asc' ? '↓' : '↑'}
                      </td>
                      <td>Alive</td>
                      <td>Score</td>
                      <td onClick={() => sortSubjects('test_chamber')} className={styles.sortableHeader}>
                        Test Chamber {sortOrder === 'asc' ? '↓' : '↑'}
                      </td>
                    </tr>
                    </thead>
                    <tbody>
                    {subjects.map(subject => (
                        <tr key={subject.id}>
                          <td>{subject.id}</td>
                          <td>{subject.name}</td>
                          <td>{formatDate(subject.date_of_birth)}</td>
                          <td>{subject.alive ? 'Y' : 'N'}</td>
                          <td>{subject.score}</td>
                          <td>{subject.test_chamber}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
              )}
              {!subjects && !message && (
                  <div className={styles.skeleton} data-testid="skeleton">
                    <table>
                      <thead>
                      <tr>
                        <td>ID</td>
                        <td>Name</td>
                        <td>DOB</td>
                        <td>Alive</td>
                        <td>Score</td>
                        <td>Test Chamber</td>
                      </tr>
                      </thead>
                      <tbody>
                      {Array.from(Array(10).keys()).map(subject => (
                          <tr key={subject}>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </>
        )}
        {paginatorInfo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Page {paginatorInfo.currentPage} of {paginatorInfo.lastPage}</span>

              <div className={styles.pagination}>
                <button
                    onClick={() => fetchPageData(paginatorInfo.currentPage - 1)}
                    disabled={paginatorInfo.currentPage <= 1}
                    style={{ marginRight: '10px' }}
                >
                  Previous
                </button>
                <button
                    onClick={() => fetchPageData(paginatorInfo.currentPage + 1)}
                    disabled={paginatorInfo.currentPage >= paginatorInfo.lastPage}
                    style={{ marginRight: '10px' }}
                >
                  Next
                </button>
              </div>
            </div>
        )}
        {authenticated && <button onClick={logout}>Log out</button>}
      </section>
    </Layout>
  )
}
