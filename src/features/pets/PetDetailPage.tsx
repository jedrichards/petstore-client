import { ImagePlus, PawPrint, Pencil, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ApiError, petStatuses } from '@/api'
import type { Pet } from '@/api'
import { QueryError } from '@/components/QueryError'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DescriptionList,
  EmptyState,
  Inline,
  LinkButton,
  PageHeader,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  useConfirm,
} from '@/design-system'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { AddToCartButton } from './AddToCartButton'
import { FavoriteButton } from './FavoriteButton'
import styles from './PetDetailPage.module.css'
import { PetPhoto } from './PetPhoto'
import { isWebUrl, petStatusLabels } from './petPresentation'
import { useDeletePet, usePet, useSetPetStatus, useUploadPetImage } from './petQueries'
import { PetStatusBadge } from './PetStatusBadge'

export function PetDetailPage() {
  const petId = Number(useParams().petId)
  const pet = usePet(petId)

  useDocumentTitle(pet.data?.name ?? 'Pet')

  if (!Number.isFinite(petId) || (pet.error instanceof ApiError && pet.error.isNotFound)) {
    return (
      <EmptyState
        icon={<PawPrint />}
        title="Pet not found"
        description="This pet does not exist, or someone deleted it from the shared demo server."
        action={
          <LinkButton to="/pets" variant="primary">
            Browse pets
          </LinkButton>
        }
      />
    )
  }

  if (pet.isError) {
    return (
      <QueryError
        title="Could not load this pet"
        error={pet.error}
        onRetry={() => void pet.refetch()}
      />
    )
  }

  if (!pet.data) return <PetDetailSkeleton />

  return <PetDetail pet={pet.data} />
}

function PetDetail({ pet }: { pet: Pet }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const setStatus = useSetPetStatus()
  const deletePet = useDeletePet()
  const uploadImage = useUploadPetImage()
  const fileInput = useRef<HTMLInputElement>(null)

  const onDelete = async () => {
    const confirmed = await confirm({
      title: `Delete ${pet.name}?`,
      description: 'This removes the pet from the store for everyone. It cannot be undone.',
      confirmLabel: 'Delete pet',
      danger: true,
    })

    if (!confirmed) return

    deletePet.mutate(pet, { onSuccess: () => void navigate('/pets') })
  }

  return (
    <>
      <PageHeader
        title={pet.name}
        meta={<PetStatusBadge status={pet.status} />}
        description={`${pet.category?.name ?? 'Uncategorised'} · ID ${pet.id}`}
        breadcrumbs={[{ label: 'Pets', to: '/pets' }, { label: pet.name }]}
        actions={
          <>
            <FavoriteButton pet={pet} variant="secondary" />
            <LinkButton to={`/pets/${pet.id}/edit`} iconStart={<Pencil />}>
              Edit
            </LinkButton>
            <Button
              variant="danger"
              iconStart={<Trash2 />}
              loading={deletePet.isPending}
              onClick={() => void onDelete()}
            >
              Delete
            </Button>
          </>
        }
      />

      <div className={styles.layout}>
        <Stack gap={4}>
          <Card className={styles.photoCard}>
            <div className={styles.photo}>
              <PetPhoto pet={pet} size="fill" />
            </div>
          </Card>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]

              if (file) uploadImage.mutate({ petId: pet.id, file })

              event.target.value = ''
            }}
          />
          <Button
            iconStart={<ImagePlus />}
            loading={uploadImage.isPending}
            onClick={() => fileInput.current?.click()}
          >
            Upload a photo
          </Button>
        </Stack>

        <Stack gap={4}>
          <Card>
            <CardHeader
              title="Availability"
              description="Changes apply at once and roll back if the server refuses."
            />
            <CardBody>
              <Stack gap={4}>
                <SegmentedControl
                  label="Status"
                  value={pet.status ?? 'available'}
                  onValueChange={(status) => {
                    if (status !== pet.status) setStatus.mutate({ pet, status })
                  }}
                  segments={petStatuses.map((value) => ({
                    value,
                    label: petStatusLabels[value],
                  }))}
                />
                <Inline>
                  <AddToCartButton pet={pet} variant="primary" />
                </Inline>
              </Stack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <CardBody>
              <DescriptionList
                items={[
                  { term: 'ID', detail: <Text mono>{pet.id}</Text> },
                  { term: 'Category', detail: pet.category?.name ?? '—' },
                  {
                    term: 'Tags',
                    detail:
                      pet.tags.length > 0 ? (
                        <Inline gap={1} wrap>
                          {pet.tags.map((tag) => (
                            <Link key={tag.name} to={`/pets?tags=${encodeURIComponent(tag.name)}`}>
                              <Badge tone="accent">{tag.name}</Badge>
                            </Link>
                          ))}
                        </Inline>
                      ) : (
                        '—'
                      ),
                  },
                  {
                    term: 'Photos',
                    detail:
                      pet.photoUrls.length > 0 ? (
                        <ul className={styles.photoList}>
                          {pet.photoUrls.map((url, index) => (
                            <li key={`${url}-${index}`}>
                              {isWebUrl(url) ? (
                                <a
                                  className={styles.photoLink}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                >
                                  {url}
                                </a>
                              ) : (
                                <Text as="span" tone="subtle" mono>
                                  {url}
                                </Text>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '—'
                      ),
                  },
                ]}
              />
            </CardBody>
          </Card>
        </Stack>
      </div>
    </>
  )
}

function PetDetailSkeleton() {
  return (
    <Stack gap={6} aria-busy aria-label="Loading pet">
      <Stack gap={2}>
        <Skeleton width={120} height={14} />
        <Skeleton width={260} height={28} />
      </Stack>
      <div className={styles.layout}>
        <Skeleton height={280} radius="lg" />
        <Stack gap={4}>
          <Skeleton height={150} radius="lg" />
          <Skeleton height={200} radius="lg" />
        </Stack>
      </div>
    </Stack>
  )
}
