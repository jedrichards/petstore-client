import { Monitor, Moon, Sun } from 'lucide-react'

import { DEFAULT_API_URL } from '@/api'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  PageHeader,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  useConfirm,
  useToast,
} from '@/design-system'
import { useFavorites } from '@/features/pets/FavoritesProvider'
import { useCart } from '@/features/store/CartProvider'
import { orderHistoryStore } from '@/features/store/orderHistory'
import { knownUsersStore } from '@/features/users/knownUsers'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { pageSizes, usePreferences } from './PreferencesProvider'
import type { PageSize } from './PreferencesProvider'
import { useTheme } from './ThemeProvider'
import type { ThemePreference } from './ThemeProvider'

export function SettingsPage() {
  useDocumentTitle('Settings')

  const { preference, setPreference: setTheme } = useTheme()
  const { preferences, setPreference, resetPreferences } = usePreferences()
  const { clearFavorites } = useFavorites()
  const cart = useCart()
  const confirm = useConfirm()
  const toast = useToast()

  const onClearData = async () => {
    const confirmed = await confirm({
      title: 'Clear local data?',
      description:
        'This empties your cart, favorites, remembered orders and users, and resets every setting. Nothing on the server changes.',
      confirmLabel: 'Clear data',
      danger: true,
    })

    if (!confirmed) return

    cart.clear()
    clearFavorites()
    orderHistoryStore.reset()
    knownUsersStore.reset()
    resetPreferences()
    setTheme('system')

    toast.success('Local data cleared')
  }

  return (
    <>
      <PageHeader title="Settings" description="Saved in this browser." />

      <Card>
        <CardHeader title="Appearance" />
        <CardBody>
          <Stack gap={5}>
            <Field label="Theme">
              <div>
                <SegmentedControl<ThemePreference>
                  label="Theme"
                  value={preference}
                  onValueChange={setTheme}
                  segments={[
                    {
                      value: 'system',
                      label: (
                        <>
                          <Monitor /> System
                        </>
                      ),
                    },
                    {
                      value: 'light',
                      label: (
                        <>
                          <Sun /> Light
                        </>
                      ),
                    },
                    {
                      value: 'dark',
                      label: (
                        <>
                          <Moon /> Dark
                        </>
                      ),
                    },
                  ]}
                />
              </div>
            </Field>

            <Field label="Pets per page">
              <Select
                value={String(preferences.pageSize)}
                onValueChange={(value) => setPreference('pageSize', Number(value) as PageSize)}
                options={pageSizes.map((size) => ({ value: String(size), label: String(size) }))}
              />
            </Field>
          </Stack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Ordering" />
        <CardBody>
          <Switch
            checked={preferences.reserveOnOrder}
            onCheckedChange={(checked) => setPreference('reserveOnOrder', checked)}
            label="Reserve pets when ordering"
            description="Marks a pet as pending once its order is placed."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="API" description="How the app talks to the Petstore server." />
        <CardBody>
          <Stack gap={5}>
            <Field label="Server">
              <Input value={DEFAULT_API_URL} readOnly />
            </Field>
            <Field
              label="API key"
              hint="Sent as the api_key header on every request. The demo server accepts special-key."
            >
              <Input
                value={preferences.apiKey}
                onChange={(event) => setPreference('apiKey', event.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </Field>
          </Stack>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Local data" />
        <CardBody>
          <Stack gap={3} align="start">
            <Text tone="muted">
              Your cart, favorites, remembered orders and users, and these settings live in this
              browser.
            </Text>
            <Button variant="danger" onClick={() => void onClearData()}>
              Clear local data
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
