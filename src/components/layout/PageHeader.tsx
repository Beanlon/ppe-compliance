interface PageHeaderProps {
  title: string
  subtitle: string
}

/**
 * Page header matching the Records / Live Feed mockups:
 * large title, gray subtitle, full-width rule under the block.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-4 sm:mb-5">
      <h1 className="text-[26px] font-bold leading-none tracking-tight text-black sm:text-[34px]">
        {title}
      </h1>
      <p className="mt-2 text-sm font-normal leading-snug text-[#666666] sm:mt-2.5 sm:text-[15px]">
        {subtitle}
      </p>
      <div className="mt-4 border-b border-[#e0e0e0] sm:mt-5" />
    </header>
  )
}
