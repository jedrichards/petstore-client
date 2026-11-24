import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import styles from './PageHeader.module.css'
import { Heading, Text } from './Text'

export interface Crumb {
  label: string
  to?: string
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: ReadonlyArray<Crumb>
  /** Shown beside the title, such as a status badge. */
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, breadcrumbs, meta, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 ? <ChevronRight className={styles.separator} aria-hidden /> : null}
                <li>
                  {crumb.to ? (
                    <Link className={styles.crumbLink} to={crumb.to}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className={styles.row}>
        <div className={styles.text}>
          <div className={styles.titleRow}>
            <Heading level={1}>{title}</Heading>
            {meta}
          </div>
          {description ? <Text tone="muted">{description}</Text> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  )
}
