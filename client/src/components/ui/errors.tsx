export function Errors({
  errors,
}: {
  errors?: ({ message: string } | string | undefined)[]
}) {
  return errors?.length ? (
    <p className="text-xs text-destructive">
      {errors
        .map((e) => e && (typeof e === 'string' ? e : e.message))
        .join(', ')}
    </p>
  ) : null
}
