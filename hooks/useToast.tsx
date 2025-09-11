export function useToast() {
  return {
    toast: ({ title, description, variant }: any) => {
      console.log('Toast:', { title, description, variant })
      if (typeof window !== 'undefined') {
        alert(`${title}: ${description}`)
      }
    }
  }
}