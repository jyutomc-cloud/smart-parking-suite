-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for parking_areas table
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_areas;