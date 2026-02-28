import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { apiImportCsv } from "../../api/import";

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export default function ImportCsvDialog({ open, onClose, type = "expense", onImported }) {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canImport = useMemo(() => !!csvText.trim() && !busy, [csvText, busy]);

  const handlePick = async (f) => {
    setError("");
    setResult(null);
    setFile(f || null);
    if (!f) {
      setCsvText("");
      return;
    }
    try {
      const txt = await readFileAsText(f);
      setCsvText(txt);
    } catch (e) {
      setError(e.message || "Failed to read file.");
    }
  };

  const doImport = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const data = await apiImportCsv({ type: type === "income" ? "income" : "expense", csvText });
      setResult(data);
      onImported?.(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (busy) return;
    setFile(null);
    setCsvText("");
    setError("");
    setResult(null);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Import CSV</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Upload a CSV with at least: <b>date</b>, <b>amount</b>, and optionally <b>category</b>, <b>description</b>.
          </Typography>

          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            disabled={busy}
            sx={{ justifyContent: "flex-start" }}
          >
            {file ? `Selected: ${file.name}` : "Choose CSV file"}
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handlePick(e.target.files?.[0] || null)}
            />
          </Button>

          {csvText ? (
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.12)",
                p: 1,
                maxHeight: 180,
                overflow: "auto",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                whiteSpace: "pre",
              }}
            >
              {csvText.slice(0, 2000)}
              {csvText.length > 2000 ? "\n…(preview truncated)" : ""}
            </Box>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}

          {result ? (
            <Alert severity={result.errors?.length ? "warning" : "success"}>
              Imported <b>{result.imported}</b> rows.
              {result.errors?.length ? ` Skipped ${result.errors.length} rows with errors.` : ""}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={busy}>Close</Button>
        <Button onClick={doImport} disabled={!canImport} variant="contained">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
