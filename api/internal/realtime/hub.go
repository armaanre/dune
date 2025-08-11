package realtime

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Hub struct {
	mu        sync.RWMutex
	clientsByForm map[string]map[*websocket.Conn]struct{}
}

func NewHub() *Hub {
	return &Hub{clientsByForm: make(map[string]map[*websocket.Conn]struct{})}
}

func (h *Hub) Add(formId string, c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clientsByForm[formId]; !ok {
		h.clientsByForm[formId] = make(map[*websocket.Conn]struct{})
	}
	h.clientsByForm[formId][c] = struct{}{}
}

func (h *Hub) Remove(formId string, c *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if m, ok := h.clientsByForm[formId]; ok {
		delete(m, c)
		if len(m) == 0 {
			delete(h.clientsByForm, formId)
		}
	}
}

func (h *Hub) Broadcast(formId string, payload any) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	conns := h.clientsByForm[formId]
	if len(conns) == 0 {
		return
	}
	b, _ := json.Marshal(payload)
	for c := range conns {
		if err := c.WriteMessage(websocket.TextMessage, b); err != nil {
			log.Println("ws write error:", err)
		}
	}
}
