package diffutil

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const diffContextLines = 2

type diffOpKind int

const (
	diffEqual diffOpKind = iota
	diffDelete
	diffInsert
)

type diffOp struct {
	kind      diffOpKind
	text      string
	leftLine  int
	rightLine int
}

// CompareText returns a unified-style line diff between two text inputs.
func CompareText(left, right, leftLabel, rightLabel string) (string, error) {
	leftLabel = defaultLabel(leftLabel, "左侧文本")
	rightLabel = defaultLabel(rightLabel, "右侧文本")

	leftLines := splitLines(left)
	rightLines := splitLines(right)
	ops := buildDiffOps(leftLines, rightLines)

	if !hasChanges(ops) {
		return fmt.Sprintf("--- %s\n+++ %s\n两段内容一致，没有差异。", leftLabel, rightLabel), nil
	}

	return formatUnifiedDiff(ops, leftLabel, rightLabel), nil
}

// CompareFiles returns a unified-style line diff between two text files.
func CompareFiles(leftPath, rightPath string) (string, error) {
	leftContent, err := os.ReadFile(leftPath)
	if err != nil {
		return "", fmt.Errorf("read left file failed: %w", err)
	}

	rightContent, err := os.ReadFile(rightPath)
	if err != nil {
		return "", fmt.Errorf("read right file failed: %w", err)
	}

	return CompareText(
		string(leftContent),
		string(rightContent),
		filepath.Base(leftPath),
		filepath.Base(rightPath),
	)
}

func defaultLabel(label, fallback string) string {
	if strings.TrimSpace(label) == "" {
		return fallback
	}
	return label
}

func splitLines(input string) []string {
	normalized := strings.ReplaceAll(input, "\r\n", "\n")
	normalized = strings.ReplaceAll(normalized, "\r", "\n")
	if normalized == "" {
		return []string{}
	}
	return strings.Split(normalized, "\n")
}

func buildDiffOps(leftLines, rightLines []string) []diffOp {
	leftCount := len(leftLines)
	rightCount := len(rightLines)

	dp := make([][]int, leftCount+1)
	for i := range dp {
		dp[i] = make([]int, rightCount+1)
	}

	for i := leftCount - 1; i >= 0; i-- {
		for j := rightCount - 1; j >= 0; j-- {
			if leftLines[i] == rightLines[j] {
				dp[i][j] = dp[i+1][j+1] + 1
				continue
			}

			if dp[i+1][j] >= dp[i][j+1] {
				dp[i][j] = dp[i+1][j]
			} else {
				dp[i][j] = dp[i][j+1]
			}
		}
	}

	reversed := make([]diffOp, 0, leftCount+rightCount)
	i, j := leftCount, rightCount
	for i > 0 || j > 0 {
		switch {
		case i > 0 && j > 0 && leftLines[i-1] == rightLines[j-1]:
			reversed = append(reversed, diffOp{kind: diffEqual, text: leftLines[i-1]})
			i--
			j--
		case j > 0 && (i == 0 || dp[i][j-1] >= dp[i-1][j]):
			reversed = append(reversed, diffOp{kind: diffInsert, text: rightLines[j-1]})
			j--
		default:
			reversed = append(reversed, diffOp{kind: diffDelete, text: leftLines[i-1]})
			i--
		}
	}

	ops := reverseOps(reversed)
	assignLineNumbers(ops)
	return ops
}

func reverseOps(ops []diffOp) []diffOp {
	for i, j := 0, len(ops)-1; i < j; i, j = i+1, j-1 {
		ops[i], ops[j] = ops[j], ops[i]
	}
	return ops
}

func assignLineNumbers(ops []diffOp) {
	leftLine := 1
	rightLine := 1

	for idx := range ops {
		ops[idx].leftLine = leftLine
		ops[idx].rightLine = rightLine

		switch ops[idx].kind {
		case diffEqual:
			leftLine++
			rightLine++
		case diffDelete:
			leftLine++
		case diffInsert:
			rightLine++
		}
	}
}

func hasChanges(ops []diffOp) bool {
	for _, op := range ops {
		if op.kind != diffEqual {
			return true
		}
	}
	return false
}

func formatUnifiedDiff(ops []diffOp, leftLabel, rightLabel string) string {
	var builder strings.Builder
	builder.WriteString(fmt.Sprintf("--- %s\n", leftLabel))
	builder.WriteString(fmt.Sprintf("+++ %s\n", rightLabel))

	hunks := buildHunks(ops)
	for index, hunk := range hunks {
		if index > 0 {
			builder.WriteString("\n")
		}

		leftStart, leftCount := hunkRange(ops[hunk.start:hunk.end], true)
		rightStart, rightCount := hunkRange(ops[hunk.start:hunk.end], false)
		builder.WriteString(fmt.Sprintf("@@ -%d,%d +%d,%d @@\n", leftStart, leftCount, rightStart, rightCount))

		for _, op := range ops[hunk.start:hunk.end] {
			switch op.kind {
			case diffEqual:
				builder.WriteString(" " + op.text + "\n")
			case diffDelete:
				builder.WriteString("-" + op.text + "\n")
			case diffInsert:
				builder.WriteString("+" + op.text + "\n")
			}
		}
	}

	return strings.TrimRight(builder.String(), "\n")
}

type diffHunk struct {
	start int
	end   int
}

func buildHunks(ops []diffOp) []diffHunk {
	changeIndexes := make([]int, 0)
	for idx, op := range ops {
		if op.kind != diffEqual {
			changeIndexes = append(changeIndexes, idx)
		}
	}

	if len(changeIndexes) == 0 {
		return nil
	}

	hunks := make([]diffHunk, 0)
	start := max(changeIndexes[0]-diffContextLines, 0)
	end := min(changeIndexes[0]+diffContextLines+1, len(ops))

	for _, changeIdx := range changeIndexes[1:] {
		nextStart := max(changeIdx-diffContextLines, 0)
		nextEnd := min(changeIdx+diffContextLines+1, len(ops))
		if nextStart <= end {
			end = max(end, nextEnd)
			continue
		}

		hunks = append(hunks, diffHunk{start: start, end: end})
		start = nextStart
		end = nextEnd
	}

	hunks = append(hunks, diffHunk{start: start, end: end})
	return hunks
}

func hunkRange(ops []diffOp, useLeft bool) (int, int) {
	if len(ops) == 0 {
		return 1, 0
	}

	start := 0
	for idx, op := range ops {
		line := op.rightLine
		if useLeft {
			line = op.leftLine
		}
		if line > 0 {
			start = line
			if op.kind == diffInsert && useLeft {
				start = max(line-1, 1)
			}
			if op.kind == diffDelete && !useLeft {
				start = max(line-1, 1)
			}
			_ = idx
			break
		}
	}

	count := 0
	for _, op := range ops {
		switch op.kind {
		case diffEqual:
			count++
		case diffDelete:
			if useLeft {
				count++
			}
		case diffInsert:
			if !useLeft {
				count++
			}
		}
	}

	return start, count
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
