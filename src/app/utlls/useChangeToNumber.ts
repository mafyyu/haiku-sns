import { useUser } from "@clerk/nextjs";

export function useChangeToNumber() {
  const { user } = useUser();

  // user.id がまだロードされていないとき
  if (!user?.id) return null;

  const userId = user.id;
  const digits = userId.match(/\d/g)?.map(Number); // 数字を配列で取り出し
  const sum = digits?.reduce((sum, element) => sum + element, 0);

  // sum が存在する場合のみ結果を返す
  if (sum !== undefined) return sum % 5;

  return null;
}
