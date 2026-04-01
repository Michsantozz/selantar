// Static route for /contract/demo — re-exports the dynamic [id] page component
// Turbopack can't resolve bracket-named dirs, so we re-export from the built module path
export { default } from '@/app/contract/[id]/page'
