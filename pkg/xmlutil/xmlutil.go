package xmlutil

import (
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"strings"
)

// Format beautifies XML input with the specified indentation level.
func Format(input string, indent int) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	result, err := encodeXML(input, indent, false)
	if err != nil {
		return "", fmt.Errorf("XML parse error: %v", err)
	}

	return strings.TrimSpace(result), nil
}

// Minify compresses XML by removing all whitespace between elements.
func Minify(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	result, err := encodeXML(input, 0, true)
	if err != nil {
		return "", fmt.Errorf("XML parse error: %v", err)
	}

	return result, nil
}

// Validate checks if the input is well-formed XML.
// Returns "Valid XML" if valid, or a detailed error message.
func Validate(input string) (string, error) {
	input = strings.TrimSpace(input)
	if input == "" {
		return "", fmt.Errorf("input is empty")
	}

	decoder := xml.NewDecoder(strings.NewReader(input))
	for {
		_, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			line := decoder.InputOffset()
			// Approximate line number from offset
			lines := strings.Split(input, "\n")
			lineNum := 1
			pos := 0
			for pos < int(line) && lineNum < len(lines)+1 {
				lineLen := len(lines[lineNum-1]) + 1
				pos += lineLen
				if pos <= int(line) {
					lineNum++
				}
			}
			return fmt.Sprintf("Invalid XML: Line %d: %v", lineNum, err), nil
		}
	}

	return "Valid XML", nil
}

// XMLNode represents a generic XML node for formatting/minifying.
type XMLNode struct {
	Type     xml.Token
	Children []XMLNode
}

func encodeXML(input string, indent int, minify bool) (string, error) {
	decoder := xml.NewDecoder(strings.NewReader(input))
	var buf bytes.Buffer
	encoder := xml.NewEncoder(&buf)
	if !minify {
		encoder.Indent("", strings.Repeat(" ", indent))
	}

	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}
		if minify {
			if charData, ok := token.(xml.CharData); ok && strings.TrimSpace(string(charData)) == "" {
				continue
			}
		}
		if err := encoder.EncodeToken(xml.CopyToken(token)); err != nil {
			return "", err
		}
	}
	if err := encoder.Flush(); err != nil {
		return "", err
	}

	return buf.String(), nil
}

// parseXMLNode recursively parses XML tokens into a node tree.
func parseXMLNode(decoder *xml.Decoder) (*XMLNode, error) {
	root := &XMLNode{}
	for {
		token, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		switch t := token.(type) {
		case xml.StartElement:
			child, err := parseXMLElement(decoder, t)
			if err != nil {
				return nil, err
			}
			root.Children = append(root.Children, *child)
		case xml.CharData:
			text := strings.TrimSpace(string(t))
			if text != "" {
				root.Children = append(root.Children, XMLNode{Type: xml.CopyToken(t)})
			}
		case xml.Comment, xml.Directive, xml.ProcInst:
			root.Children = append(root.Children, XMLNode{Type: xml.CopyToken(t)})
		case xml.EndElement:
			// Should not happen at top level
		}
	}
	return root, nil
}

// parseXMLElement parses a StartElement and all its children until the matching EndElement.
func parseXMLElement(decoder *xml.Decoder, start xml.StartElement) (*XMLNode, error) {
	node := &XMLNode{Type: start}
	for {
		token, err := decoder.Token()
		if err != nil {
			return nil, err
		}

		switch t := token.(type) {
		case xml.StartElement:
			child, err := parseXMLElement(decoder, t)
			if err != nil {
				return nil, err
			}
			node.Children = append(node.Children, *child)
		case xml.CharData:
			text := strings.TrimSpace(string(t))
			if text != "" {
				node.Children = append(node.Children, XMLNode{Type: xml.CopyToken(t)})
			}
		case xml.EndElement:
			if t.Name.Local == start.Name.Local {
				return node, nil
			}
		case xml.Comment, xml.Directive, xml.ProcInst:
			node.Children = append(node.Children, XMLNode{Type: xml.CopyToken(t)})
		}
	}
}

// formatXMLNode formats a node tree into a pretty-printed string.
func formatXMLNode(node *XMLNode, prefix string, indent string) string {
	var result strings.Builder

	switch t := node.Type.(type) {
	case xml.StartElement:
		result.WriteString(prefix)
		result.WriteString("<")
		result.WriteString(t.Name.Local)
		for _, attr := range t.Attr {
			result.WriteString(fmt.Sprintf(" %s=\"%s\"", attr.Name.Local, attr.Value))
		}
		if len(node.Children) == 0 {
			result.WriteString(" />\n")
		} else if len(node.Children) == 1 {
			// Single text child: inline
			switch childType := node.Children[0].Type.(type) {
			case xml.CharData:
				result.WriteString(">")
				result.WriteString(string(childType))
				result.WriteString(fmt.Sprintf("</%s>\n", t.Name.Local))
			default:
				result.WriteString(">\n")
				for _, child := range node.Children {
					result.WriteString(formatXMLNode(&child, prefix+indent, indent))
				}
				result.WriteString(prefix)
				result.WriteString(fmt.Sprintf("</%s>\n", t.Name.Local))
			}
		} else {
			result.WriteString(">\n")
			for _, child := range node.Children {
				result.WriteString(formatXMLNode(&child, prefix+indent, indent))
			}
			result.WriteString(prefix)
			result.WriteString(fmt.Sprintf("</%s>\n", t.Name.Local))
		}
	case xml.CharData:
		result.WriteString(prefix)
		result.WriteString(string(t))
		result.WriteString("\n")
	case xml.Comment:
		result.WriteString(prefix)
		result.WriteString(fmt.Sprintf("<!-- %s -->\n", strings.TrimSpace(string(t))))
	case xml.Directive:
		result.WriteString(prefix)
		result.WriteString(fmt.Sprintf("<!%s>\n", string(t)))
	case xml.ProcInst:
		result.WriteString(prefix)
		result.WriteString(fmt.Sprintf("<?%s %s?>\n", t.Target, string(t.Inst)))
	default:
		// Root node: just format children
		for _, child := range node.Children {
			result.WriteString(formatXMLNode(&child, prefix, indent))
		}
	}

	return result.String()
}

// minifyXMLNode serializes a node tree without any whitespace.
func minifyXMLNode(node *XMLNode) string {
	var result strings.Builder

	switch t := node.Type.(type) {
	case xml.StartElement:
		result.WriteString("<")
		result.WriteString(t.Name.Local)
		for _, attr := range t.Attr {
			result.WriteString(fmt.Sprintf(" %s=\"%s\"", attr.Name.Local, attr.Value))
		}
		if len(node.Children) == 0 {
			result.WriteString("/>")
		} else {
			result.WriteString(">")
			for _, child := range node.Children {
				result.WriteString(minifyXMLNode(&child))
			}
			result.WriteString(fmt.Sprintf("</%s>", t.Name.Local))
		}
	case xml.CharData:
		result.WriteString(string(t))
	case xml.Comment:
		result.WriteString(fmt.Sprintf("<!--%s-->", strings.TrimSpace(string(t))))
	case xml.ProcInst:
		result.WriteString(fmt.Sprintf("<?%s %s?>", t.Target, string(t.Inst)))
	default:
		for _, child := range node.Children {
			result.WriteString(minifyXMLNode(&child))
		}
	}

	return result.String()
}
