"use client";

// Кнопка відправки форми, яка перед дією питає підтвердження (вікно браузера).
// Якщо людина натисне "Скасувати", форма не відправляється і нічого не видаляється.
export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
