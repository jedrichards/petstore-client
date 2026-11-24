import { LayoutGrid, List, PawPrint, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'

import { petStatuses } from '@/api'
import type { PetStatus } from '@/api'
import { QueryError } from '@/components/QueryError'
import {
  Button,
  Card,
  EmptyState,
  Grid,
  IconButton,
  Inline,
  Input,
  LinkButton,
  PageHeader,
  Pagination,
  SegmentedControl,
  Select,
  Skeleton,
  Stack,
  TagInput,
} from '@/design-system'
import { usePreferences } from '@/features/preferences/PreferencesProvider'
import type { PetView } from '@/features/preferences/PreferencesProvider'
import { useInventory } from '@/features/store/storeQueries'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { PetCard } from './PetCard'
import { categoriesOf, filterPets, petStatusLabels } from './petPresentation'
import type { PetSort } from './petPresentation'
import { usePetsByStatus, usePetsByTags } from './petQueries'
import styles from './PetsPage.module.css'
import { PetTable } from './PetTable'

const sortOptions: ReadonlyArray<{ value: PetSort; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Highest ID' },
  { value: 'oldest', label: 'Lowest ID' },
]

function parseStatus(value: string | null): PetStatus {
  return petStatuses.find((status) => status === value) ?? 'available'
}

function parseSort(value: string | null): PetSort {
  return sortOptions.find((option) => option.value === value)?.value ?? 'name'
}

/**
 * Browse pets. Every filter lives in the URL, so a filtered view can be
 * bookmarked, shared and reached with the back button.
 */
export function PetsPage() {
  useDocumentTitle('Pets')

  const { preferences, setPreference } = usePreferences()
  const [searchParams, setSearchParams] = useSearchParams()

  const status = parseStatus(searchParams.get('status'))
  const sort = parseSort(searchParams.get('sort'))
  const category = searchParams.get('category') ?? ''
  const urlQuery = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const tags = useMemo(
    () => (searchParams.get('tags') ?? '').split(',').filter(Boolean),
    [searchParams],
  )

  const setParams = (changes: Record<string, string | undefined>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)

        // Any filter change returns to the first page.
        if (!('page' in changes)) next.delete('page')

        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || value === '') next.delete(key)
          else next.set(key, value)
        }

        return next
      },
      { replace: true },
    )
  }

  // The search box updates at once; the URL follows after a pause in typing.
  const [queryDraft, setQueryDraft] = useState(urlQuery)
  const writeQueryToUrl = useDebouncedCallback((query: string) => setParams({ q: query }))

  const onQueryChange = (query: string) => {
    setQueryDraft(query)
    writeQueryToUrl(query)
  }

  // When the URL changes from elsewhere, such as the back button, follow it.
  const [syncedQuery, setSyncedQuery] = useState(urlQuery)

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery)
    setQueryDraft(urlQuery)
  }

  const searchingByTag = tags.length > 0
  const byStatus = usePetsByStatus(status)
  const byTags = usePetsByTags(tags)
  const source = searchingByTag ? byTags : byStatus
  const inventory = useInventory()

  const loadedPets = source.data
  const categories = useMemo(() => categoriesOf(loadedPets ?? []), [loadedPets])

  const visiblePets = useMemo(
    () =>
      filterPets(loadedPets ?? [], {
        query: urlQuery,
        category,
        sort,
        // The tag endpoint returns every status, so narrow it here.
        status: searchingByTag ? status : undefined,
      }),
    [loadedPets, urlQuery, category, sort, searchingByTag, status],
  )

  const pageSize = preferences.pageSize
  const pageCount = Math.max(1, Math.ceil(visiblePets.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pagePets = visiblePets.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const hasFilters = urlQuery !== '' || category !== '' || searchingByTag

  return (
    <>
      <PageHeader
        title="Pets"
        description="Browse, search and manage every pet in the store."
        actions={
          <LinkButton to="/pets/new" variant="primary" iconStart={<Plus />}>
            Add pet
          </LinkButton>
        }
      />

      <Card padding="md">
        <Stack gap={3}>
          <div className={styles.toolbar}>
            <SegmentedControl
              label="Status"
              value={status}
              onValueChange={(next) => setParams({ status: next })}
              segments={petStatuses.map((value) => ({
                value,
                label: petStatusLabels[value],
                detail: inventory.data?.counts[value],
              }))}
            />

            <Inline gap={2}>
              <Select
                aria-label="Sort by"
                value={sort}
                onValueChange={(next) => setParams({ sort: next === 'name' ? undefined : next })}
                options={sortOptions}
              />
              <SegmentedControl<PetView>
                label="View"
                value={preferences.petView}
                onValueChange={(next) => setPreference('petView', next)}
                segments={[
                  { value: 'grid', label: <LayoutGrid aria-label="Grid" /> },
                  { value: 'table', label: <List aria-label="Table" /> },
                ]}
              />
            </Inline>
          </div>

          <div className={styles.filters}>
            <Input
              type="search"
              aria-label="Filter by name, tag or ID"
              placeholder="Filter by name, tag or ID"
              leading={<Search />}
              value={queryDraft}
              onChange={(event) => onQueryChange(event.target.value)}
              trailing={
                queryDraft ? (
                  <IconButton label="Clear filter" size="sm" onClick={() => onQueryChange('')}>
                    <X />
                  </IconButton>
                ) : undefined
              }
            />
            <Select
              aria-label="Category"
              value={category}
              onValueChange={(next) => setParams({ category: next })}
              options={[
                { value: '', label: 'All categories' },
                // Keep a category from the URL selectable even before pets load.
                ...[...new Set([...categories, ...(category ? [category] : [])])].map((name) => ({
                  value: name,
                  label: name,
                })),
              ]}
            />
            <TagInput
              value={tags}
              onValueChange={(next) => setParams({ tags: next.join(',') })}
              placeholder="Search the server by tag…"
            />
          </div>
        </Stack>
      </Card>

      {source.isError ? (
        <QueryError
          title="Could not load pets"
          error={source.error}
          onRetry={() => void source.refetch()}
        />
      ) : source.isPending ? (
        <PetGridSkeleton />
      ) : pagePets.length === 0 ? (
        <EmptyState
          icon={<PawPrint />}
          title={hasFilters ? 'No pets match these filters' : `No ${status} pets`}
          description={
            hasFilters
              ? 'Try a different name, category or tag.'
              : 'Nobody has listed a pet with this status yet.'
          }
          action={
            hasFilters ? (
              <Button
                onClick={() => {
                  setQueryDraft('')
                  setParams({ q: undefined, category: undefined, tags: undefined })
                }}
              >
                Clear filters
              </Button>
            ) : (
              <LinkButton to="/pets/new" variant="primary">
                Add a pet
              </LinkButton>
            )
          }
        />
      ) : (
        <>
          {preferences.petView === 'grid' ? (
            <Grid minColumnWidth={220}>
              {pagePets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </Grid>
          ) : (
            <Card>
              <PetTable pets={pagePets} />
            </Card>
          )}

          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={visiblePets.length}
            itemLabel="pets"
            onPageChange={(next) => setParams({ page: next === 1 ? undefined : String(next) })}
          />
        </>
      )}
    </>
  )
}

function PetGridSkeleton() {
  return (
    <Grid minColumnWidth={220} aria-busy aria-label="Loading pets">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} padding="md">
          <Stack gap={3}>
            <Skeleton height={140} radius="md" />
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} />
          </Stack>
        </Card>
      ))}
    </Grid>
  )
}
