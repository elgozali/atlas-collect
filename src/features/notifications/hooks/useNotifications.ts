import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../services";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getNotifications,
    refetchInterval: 5000,
  });
