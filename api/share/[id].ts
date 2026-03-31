export default function handler(req: any, res: any) {
  const url = req.url || "";

  const id = url.split("/api/share/")[1];

  if (!id) {
    return res.status(400).send("Missing id (manual parse)");
  }

  return res.status(200).send(JSON.stringify({
    parsedId: id,
    url
  }));
}