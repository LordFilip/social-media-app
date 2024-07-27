import Navbar from '../components/Navbar/Navbar'
import useGetPosts from '../hooks/useGetPosts'
import styles from './Styles/ProfilePage.module.css'
import image from '../../public/assets/auth-image.jpg'

const ProfilePage = () => {
  const { posts, loading, error } = useGetPosts()

  return (
    <div className={styles.profilePageContainer}>
      <Navbar />
      <div className={styles.coverPhoto}>
        <img src={image} alt="" />
        <div className={styles.profilePhoto}>
          <img src={image} alt="" />
        </div>
      </div>
      <h1>Profile Page</h1>
      {loading && <p>Loading posts...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {posts.length === 0 && !loading && <p>No posts available</p>}
      <ul className={styles.postList}>
        {posts.map((post, index) => (
          <li key={index} className={styles.postItem}>
            {post}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProfilePage
