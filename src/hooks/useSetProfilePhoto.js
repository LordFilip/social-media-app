import { useState } from 'react'
import { storage, firestore } from '../firebase/config'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'

const useSetProfilePhoto = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteExistingProfilePhotos = async (uid) => {
    try {
      const userPhotosRef = ref(storage, `profilePhotos/${uid}`)
      const listResult = await listAll(userPhotosRef)

      const deletePromises = listResult.items.map((itemRef) =>
        deleteObject(itemRef)
      )
      await Promise.all(deletePromises)
    } catch (err) {
      console.error('Error deleting existing profile photos:', err)
      throw new Error('Failed to delete existing profile photos')
    }
  }

  const setProfilePhoto = async (fileOrURL) => {
    setLoading(true)
    setError(null)

    try {
      // Retrieve user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('user-info'))

      if (!userInfo || !userInfo.uid) {
        throw new Error('User ID not found in localStorage')
      }

      const uid = userInfo.uid

      // Delete existing profile photos
      await deleteExistingProfilePhotos(uid)

      let downloadURL = ''

      if (typeof fileOrURL === 'string') {
        // Assume it's a URL
        downloadURL = fileOrURL
      } else {
        // Assume it's a file
        const storageRef = ref(
          storage,
          `profilePhotos/${uid}/${fileOrURL.name}`
        )
        const snapshot = await uploadBytes(storageRef, fileOrURL)
        downloadURL = await getDownloadURL(snapshot.ref)
      }

      // Update the Firestore document with the new profile photo URL
      await updateDoc(doc(firestore, 'users', uid), {
        profilePicURL: downloadURL,
      })

      // Update the user info in localStorage
      userInfo.profilePicURL = downloadURL
      localStorage.setItem('user-info', JSON.stringify(userInfo))

      setLoading(false)
      return true // Photo upload and update successful
    } catch (err) {
      setError(
        err.message ||
          'An unexpected error occurred while setting the profile photo'
      )
      console.error('Error setting profile photo:', err)
      setLoading(false)
      return false // Indicate failure
    }
  }

  return { setProfilePhoto, loading, error }
}

export default useSetProfilePhoto
